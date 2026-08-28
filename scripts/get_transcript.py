import json
from youtube_transcript_api import YouTubeTranscriptApi

video_id = 'krSePO1QsDI'
print(f"Fetching transcript for {video_id} using YouTubeTranscriptApi().fetch()...")

try:
    api = YouTubeTranscriptApi()
    cues_obj = api.fetch(video_id, languages=['en'])
    # Convert FetchedTranscript to list of dicts
    cues = []
    for snippet in cues_obj:
        cues.append({
            'start': round(snippet.start, 2),
            'duration': round(snippet.duration, 2),
            'text': snippet.text
        })
    print(f"SUCCESS: Fetched {len(cues)} cues successfully!")

    total_duration = cues[-1]['start'] + cues[-1]['duration'] if cues else 0
    words = [c['text'] for c in cues]
    full_narrative = ' '.join(words)
    total_words = len(full_narrative.split())
    wpm = round((total_words / (total_duration / 60)), 1) if total_duration > 0 else 0

    editorial_data = {
        "videoId": video_id,
        "title": "How the U.S. Doomsday Plane Works",
        "channel": "neo",
        "channelUrl": "https://www.youtube.com/@neoexplains",
        "totalDurationSeconds": round(total_duration, 2),
        "totalMinutes": round(total_duration / 60, 2),
        "totalWords": total_words,
        "wordsPerMinute": wpm,
        "totalCues": len(cues),
        "fullNarrative": full_narrative,
        "cues": cues
    }

    out_file = 'assets/editorial-references/editor/neo_doomsday_plane_transcript.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(editorial_data, f, indent=2, ensure_ascii=False)
    print(f"Saved complete transcript to {out_file}")

except Exception as e:
    print(f"Error fetching transcript: {e}")
