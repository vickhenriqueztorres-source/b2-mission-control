import urllib.request
import os
import time

curated_photos = {
    'smartphone_hand': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1920&auto=format&fit=crop',
    'satellite_space': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop',
    'deep_sea_ocean': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920&auto=format&fit=crop',
    'fiber_optic_glowing': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1920&auto=format&fit=crop',
    'cable_coaxial_metal': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1920&auto=format&fit=crop',
    'coast_night_brazil': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1920&auto=format&fit=crop',
    'laser_silica_lab': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1920&auto=format&fit=crop',
    'microscope_precision': 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1920&auto=format&fit=crop',
    'server_room_datacenter': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1920&auto=format&fit=crop',
    'container_ship_ocean': 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1920&auto=format&fit=crop',
    'high_voltage_transformer': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1920&auto=format&fit=crop',
    'beach_landing_station': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop',
    'network_noc_screens': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1920&auto=format&fit=crop',
    'underwater_diver_abyss': 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1920&auto=format&fit=crop',
    'city_night_traffic': 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?q=80&w=1920&auto=format&fit=crop'
}

os.makedirs('assets/submarine_curated', exist_ok=True)

for name, url in curated_photos.items():
    target = f'assets/submarine_curated/{name}.jpg'
    if os.path.exists(target) and os.path.getsize(target) > 10000:
        print(f"[EXISTS] {name} ({os.path.getsize(target)/1024:.1f} KB)")
        continue
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                data = resp.read()
                with open(target, 'wb') as f:
                    f.write(data)
                print(f"[SAVED] {name} ({len(data)/1024:.1f} KB)")
            else:
                print(f"[HTTP {resp.status}] {name}")
    except Exception as e:
        print(f"[ERROR] {name}: {e}")
    time.sleep(0.5)

print("Done downloading curated photos.")
