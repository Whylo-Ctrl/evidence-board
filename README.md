# Evidence Board

A shared evidence wall for your Delta Green table. Up to 4 people per case (Handler included) can pin photos, papers and post-its, tie them together with red string, and see each other's changes live from their own phone or laptop.

The app is one file, `index.html`, plus the photos in the `assets` folder: rooms, boards, cut-out post-its (some bent, some with a paperclip, tape or pin), torn and crumpled notebook paper, torn cardboard, the polaroid frame and the cardboard tray. Keep the `assets` folder next to `index.html` when you copy or host it.

## Shared rooms

This copy is already connected to the Firebase project **evidence-board** (`evidence-board-fef83`) on the free Spark plan, so cases sync across everyone's devices. The connection settings are at the top of the script in `index.html`. They're safe to have in a public repo; the database rules control access:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "rooms": {
      "$code": {
        ".read": true,
        ".write": true,
        ".validate": "$code.matches(/^[A-Z0-9]{4}$/)"
      }
    }
  }
}
```

To test on one device without touching the shared database, clear the `databaseURL` value and the board switches to practice mode, which only saves on that device.

The site is hosted with GitHub Pages from the `main` branch of this repo.

## How to play

**Opening a case.** The Handler enters a codename, picks a pin color and taps **Open a new case**. They get a 4-character case code.

**Joining.** Agents open the site, enter their codename, type the code and tap **Join case**. The Handler can also tap the case code in the top-left corner to copy an invite link, which fills in the code automatically.

**Seats.** Each case has 4 seats. If someone switches devices, they rejoin with the same codename to get their seat back. The Handler can remove an agent from **Case settings** to free up a seat.

**The 3D room.** When you open or join a case you walk into a 3D room: walls, floor and ceiling textured from the room you picked, furnished to match it (a dark office with a desk lamp, typewriter and filing cabinet; a cabin with a wood stove and lantern; a study with bookshelves, an armchair and a floor lamp; a workshop with a workbench and pegboard; a factory with pipes and fluorescent tubes; a bright white-brick studio; a garage with a tool chest and tyres; a den; an archive full of filing cabinets and case boxes; a precinct office with caged lamps and evidence boxes; and a candle-dark attic for the tabletop). Your board hangs on the wall showing your real notes, papers, string and marker. Drag to look around (WASD or the arrow keys walk on a computer), and pinch or scroll to zoom. **Click or tap the board** and you walk up to it and switch to the board view to work on it. Tap **Room** at the top to step back into the room. The 3D room is drawn with three.js (`room3d.js`), and the room textures are in `assets` (`t-*.webp`). On computers the room also gets ambient-occlusion contact shadows, a soft glow around lights, film grain and a vignette, plus real shadows from the main bulb. Phones get lighter settings; if a device can't do 3D, you go straight to the board.

**Real furniture.** On computers the rooms use real 3D models for the furniture and props (desks, chairs, armchair, bookshelf, clamp lamp, barrel stove, lantern, crates, barrels, steel shelving, tool chest and cart, bench vise, tyres, plant, magnifying glass, cardboard boxes, hanging lamps, fluorescent lights, wall clock, notepads). They're CC0 models from [Poly Haven](https://polyhaven.com), packed as `.glb` files in `assets/models`. Walls, floors and ceilings use real tileable CC0 materials from Poly Haven too (plaster, wood panelling, planks, parquet, brick, concrete, linoleum, corrugated iron), with normal and roughness maps for depth on computers; they're in `assets/pbr`. Phones use simpler shapes to save memory and data.

**Your team in the room.** Everyone in the same case shows up in the 3D room as a detective in a trench coat and fedora in their pin colour, with their codename floating above. You see where they're standing and which way they're looking. Anyone working in the board view stands in front of the board.

**Saving.** The board saves automatically. Next session, enter the same code and everything is where you left it.

### On the board

The tray at the bottom has five tools.

- **Photo** pins a picture from your phone or computer. Pick a style: **Polaroid**, **Mugshot** (with a booking placard), or **Surveillance** (black-and-white camera still with a timestamp).
- **Paper** pins **note paper** (a torn, crumpled or hole-punched notebook page with an optional Classified, Top secret, or Eyes only stamp), **cardboard** (a torn piece of box with marker writing), a **map** (a folded street map with a place name and notes in the corner), a **case card** (a question with notes, one per line), or a **newspaper clipping** (headline and article in columns).
- **Post-it** pins a quick handwritten note in yellow, pink, blue, green, purple, cream or white. Yellow ones sometimes come with a paperclip, tape or a pushpin.
- **String** ties items together with red string. Tap one item, then the item to tie it to, and keep going until you tap **Done**. Pick red, black, yellow or blue string to color-code leads.
- **Marker** lets you draw on the board with your finger or mouse (circle a suspect, draw arrows), or tap **Type** to write words instead: tap where they go, type, pick a size, and they appear in thick marker lettering. Finished lines get a felt-tip look. Choose red or black, use **Undo** for your last mark, and tap **Done** to go back to moving things.

Moving around:

- **Drag** anything to move it. Whatever you pick up comes to the front. Things can hang partly off the edge of the board, like a real one.
- **Tap** an item for Edit, Tie string, or Remove. Double-tap to edit straight away.
- **Tap a string** to cut it, or **tap a marker line or marker words** to erase them.
- **Drag the empty wall** to pan, and pinch (phone) or use the mouse wheel (computer) to zoom out and see the whole room. **Board** glides in until the board fills the screen. **Fit** zooms to your items; tap it again for the whole board with the room around it.

### Flat or 3D

Tap **3D** at the top of the screen (or pick it in **Case settings → View**) to switch the room into 3D. The room photo becomes the back wall with a floor, ceiling and side walls around it, and the board itself becomes a thick panel standing off the wall on a frame, casting a shadow behind it. Pan toward an edge and you'll see the board's sides. Items lift toward you when you pick them up. Tap it again to go back to flat. It's a personal setting, so each agent can choose their own, and flat is lighter on older phones.

### On a phone

The board is built to stay light on phones, especially iPhones: items aren't given their own graphics layers, shadows are baked into the images, and the board is drawn straight to the screen at whatever zoom you're at. 3D view is only offered on computers, because it needs more graphics memory than phones and tablets allow.


- **One finger** drags items around. **Two fingers** move the board and pinch to zoom. **Fit** brings everything back into view.
- In Marker mode, one finger draws and two fingers still move the board.
- **Case settings → Share invite link** opens your phone's share sheet, so you can send the case straight to a group chat.
- **Case settings → Keep screen awake** stops your phone from dimming during the session (works in current Chrome and Safari).

### Redacting

To redact words on a paper or post-it, select them in the text box and tap **Redact selection**. They show up as black bars on the board. To undo, delete the `[[ ]]` around them.

Redaction is for atmosphere. The original words are still saved behind the scenes, so don't use it to hide real secrets from someone who knows how to dig through a web page.

### Handler controls

In **Case settings**, the Handler sets the scene for everyone: the **room** (a dark office with a desk lamp, rotary phone and typewriter on the desk under the board, the den, archive, precinct or tabletop, where the board sits right where it is in the photo, or a cabin, study, workshop, factory, white brick room or garage, each a real photo) and the **board** (plywood in a dark wooden frame, cork in a pine frame, cork in a metal frame, a whiteboard, or pinning straight to the wall). The Handler also picks whether the board stands on a wooden **easel** or is **hung on the wall** from a wire and nail. In the dark office the board always hangs on the wall above the desk. **Lighting** can be a moody **desk lamp** (warm light from the lower left, dark corners) or **lights on**. New cases start in the cabin with the plywood board on an easel, lit by the desk lamp. The Handler can also remove agents and clear the whole board (items, strings and marker lines). Anyone can turn pin sounds on or off for themselves.
