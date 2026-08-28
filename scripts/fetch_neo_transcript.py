import urllib.request
import json
import re
import xml.etree.ElementTree as ET

video_id = 'krSePO1QsDI'
url = f'https://www.youtube.com/watch?v={video_id}'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        
    match = re.search(r'"captionTracks":\s*(\[.+?\])', html)
    if match:
        captions = json.loads(match.group(1))
        print(f"Found {len(captions)} caption tracks.")
        for c in captions:
            lang = c.get('languageCode')
            base_url = c.get('baseUrl')
            print(f"Fetching {lang} from {base_url}...")
            
            # Try with fmt=json3 for structured json
            json_url = base_url + ('&fmt=json3' if 'fmt=' not in base_url else '')
            cap_req = urllib.request.Request(json_url, headers=headers)
            try:
                with urllib.request.urlopen(cap_req) as cap_resp:
                    raw_content = cap_resp.read().decode('utf-8')
                
                parsed_json = json.loads(raw_content)
                events = parsed_json.get('events', [])
                transcript_items = []
                full_text = []
                for ev in events:
                    if 'segs' in ev:
                        text = ''.join(s.get('utf8', '') for s in ev['segs']).strip()
                        if text:
                            start_ms = ev.get('tStartMs', 0)
                            dur_ms = ev.get('dDurationMs', 0)
                            transcript_items.append({
                                'start': round(start_ms / 1000.0, 2),
                                'duration': round(dur_ms / 1000.0, 2),
                                'text': text
                            })
                            full_text.append(text)
                            
                out_json = 'assets/editorial-references/editor/neo_doomsday_plane_breakdown.json'
                with open(out_json, 'w', encoding='utf-8') as f:
                    json.dump({
                        'videoId': video_id,
                        'title': 'How the U.S. Doomsday Plane Works',
                        'channel': 'neo',
                        'channelUrl': 'https://www.youtube.com/@neoexplains',
                        'totalCues': len(transcript_items),
                        'totalDurationEstimated': transcript_items[-1]['start'] + transcript_items[-1]['duration'] if transcript_items else 0,
                        'cues': transcript_items,
                        'fullNarrative': ' '.join(full_text)
                    }, f, indent=2, ensure_ascii=False)
                print(f"SUCCESS: Transcricao salva em {out_json} com {len(transcript_items)} falas.")
                break
            except Exception as ex_json:
                print(f"Erro JSON3: {ex_json}")
    else:
        print("Nao foi possivel encontrar captionTracks diretamente.")
except Exception as e:
    print(f"Erro geral: {e}")

