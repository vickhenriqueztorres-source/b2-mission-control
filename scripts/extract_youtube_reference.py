import re
import json
import urllib.request
import xml.etree.ElementTree as ET

content_file = r"C:\Users\brend\.gemini\antigravity\brain\458559fc-b6a0-43b0-900e-40923ec3998e\.system_generated\steps\1189\content.md"

with open(content_file, 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Title
title_match = re.search(r'<title>(.*?)</title>', html)
print('TITLE TAG:', title_match.group(1) if title_match else 'None')

# Look for ytInitialPlayerResponse
player_match = re.search(r'ytInitialPlayerResponse\s*=\s*({.+?});(?:var|</script>)', html)
if player_match:
    try:
        player_data = json.loads(player_match.group(1))
        details = player_data.get('videoDetails', {})
        print('\n=== VIDEO DETAILS ===')
        print('Title:', details.get('title'))
        print('Author/Channel:', details.get('author'))
        print('Length (seconds):', details.get('lengthSeconds'))
        print('View Count:', details.get('viewCount'))
        print('Keywords:', details.get('keywords', [])[:10])
        print('Description Snippet:\n', details.get('shortDescription', '')[:500])

        captions = player_data.get('captions', {}).get('playerCaptionsTracklistRenderer', {}).get('captionTracks', [])
        print('\n=== CAPTION TRACKS ===')
        for idx, cap in enumerate(captions):
            lang = cap.get('languageCode')
            name = cap.get('name', {}).get('simpleText')
            base_url = cap.get('baseUrl')
            print(f"[{idx}] {lang} ({name}) -> {base_url[:80]}...")
            
            # Fetch captions
            if base_url:
                try:
                    req = urllib.request.Request(base_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req) as resp:
                        xml_data = resp.read().decode('utf-8')
                        root = ET.fromstring(xml_data)
                        transcript_items = []
                        for text_tag in root.findall('text'):
                            start = text_tag.get('start')
                            dur = text_tag.get('dur')
                            text = text_tag.text or ''
                            transcript_items.append({'start': float(start), 'dur': float(dur), 'text': text})
                        
                        out_transcript = f"assets/editorial-references/editor/reference_video_{details.get('videoId', 'krSePO1QsDI')}_{lang}.json"
                        with open(out_transcript, 'w', encoding='utf-8') as tf:
                            json.dump({
                                'videoId': details.get('videoId'),
                                'title': details.get('title'),
                                'author': details.get('author'),
                                'durationSeconds': details.get('lengthSeconds'),
                                'transcript': transcript_items
                            }, tf, indent=2, ensure_ascii=False)
                        print(f"Successfully saved {len(transcript_items)} subtitle lines to {out_transcript}")
                except Exception as ex:
                    print(f"Failed to fetch caption {lang}: {ex}")

    except Exception as e:
        print('Error parsing JSON:', e)
else:
    print('Could not find ytInitialPlayerResponse directly in content.md')
