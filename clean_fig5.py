import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

assets_dir = os.path.join(os.path.dirname(__file__), 'report_assets')
os.makedirs(assets_dir, exist_ok=True)

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

def create_wad_fig5_clean():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    t_box = patches.FancyBboxPatch((5, 88), 90, 8, boxstyle="round,pad=0.4", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(t_box)
    ax.text(50, 92, "HUMSAFAR: RESPONSIVE UI LAYOUT & WIREFRAME SCHEMATIC", color="white", fontsize=12, fontweight='bold', ha='center', va='center')

    # Top Navbar Mock
    nav = patches.FancyBboxPatch((5, 78), 90, 7, boxstyle="round,pad=0.2", ec="#1E293B", fc="#0F172A")
    ax.add_patch(nav)
    ax.text(8, 81.5, "HUMSAFAR TRIP PLANNER", color="#818CF8", fontsize=9, fontweight='bold', va='center')
    ax.text(42, 81.5, "Destinations    Dashboard    Firestore Explorer    Admin", color="#94A3B8", fontsize=7.5, va='center')
    ax.text(88, 81.5, "[Profile] [Logout]", color="#38BDF8", fontsize=7.5, ha='right', va='center')

    # Main Trip Hero Banner
    hero = patches.FancyBboxPatch((5, 58), 90, 17, boxstyle="round,pad=0.3", ec="#3B82F6", fc="#1E293B")
    ax.add_patch(hero)
    ax.text(8, 70, "Spring Cherry Blossom Tour in Kyoto (Kyoto, Japan)", color="#FFFFFF", fontsize=11, fontweight='bold')
    ax.text(8, 64, "Dates: Nov 10 - Nov 15, 2026 (6 Days)  •  Travelers: 2  •  Budget: $3,200  •  Status: ACTIVE", color="#94A3B8", fontsize=8)
    ax.text(8, 60, "Actions: [+ Add Activity]  [+ Add Stay]  [+ Add Transit]  [+ Log Expense]  [Duplicate Trip]", color="#38BDF8", fontsize=7.5)

    # 3 Column Layout below
    # Col 1: Day-by-Day Timeline
    c1 = patches.FancyBboxPatch((5, 8), 34, 46, boxstyle="round,pad=0.4", ec="#CBD5E1", fc="#F8FAFC", lw=1.5)
    ax.add_patch(c1)
    ax.text(22, 50, "Day-by-Day Itinerary Timeline", color="#0F172A", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(22, 28, "• Day 1: Arrival & Historic Higashiyama\n  - 09:30 Matcha Tasting @ Uji ($35)\n  - 14:00 Kiyomizu-dera Temple ($10)\n  - 18:00 Gion Geisha District Tour ($60)\n\n• Day 2: Arashiyama Bamboo Grove\n  - 08:30 Sagano Scenic Train ($18)\n  - 12:00 Tenryu-ji Zen Gardens ($12)\n\n• Day 3: Fushimi Inari Shrine Hike\n  - 07:00 10,000 Torii Gates Trail", 
            color="#334155", fontsize=7, ha='center')

    # Col 2: Interactive Leaflet Map
    c2 = patches.FancyBboxPatch((41, 8), 28, 46, boxstyle="round,pad=0.4", ec="#0D9488", fc="#F0FDFA", lw=1.5)
    ax.add_patch(c2)
    ax.text(55, 50, "Interactive Leaflet Map Canvas", color="#0F766E", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(55, 28, "[ OpenStreetMap Layer ]\n\n- Marker: Kyoto Station (Transit)\n- Marker: Machiya Villa (Hotel)\n- Marker: Kiyomizu-dera (Sight)\n- Marker: Arashiyama (Emerald Sight)\n\n• Dynamic Pin Clustering & Plotting\n• Popup Info Cards on Marker Click\n• Auto-Centering Map Bounds", 
            color="#1E293B", fontsize=7, ha='center')

    # Col 3: Budget Chart & Packing Tracker
    c3 = patches.FancyBboxPatch((71, 8), 24, 46, boxstyle="round,pad=0.4", ec="#7C3AED", fc="#F5F3FF", lw=1.5)
    ax.add_patch(c3)
    ax.text(83, 50, "Live Budget & Checklist Hub", color="#6D28D9", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(83, 28, "Spent: $320.00 / $3,200.00 (10%)\n[===== Spending Gauge Bar =====]\n\nCategory Breakdown:\n• Food: $180.00 (56%)\n• Transit: $140.00 (44%)\n\nPacking Progress: 5 / 8 (62%)\n[x] Passport & Rail Pass\n[x] Power Adapter & Cables\n[ ] Universal eSIM Data", 
            color="#1E293B", fontsize=7, ha='center')

    path = os.path.join(assets_dir, 'wad_fig5_ui_wireframes_layout.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()
    print("Re-generated clean wad_fig5")

create_wad_fig5_clean()
