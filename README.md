# Evidence Board

A shared evidence wall for your Delta Green table. Up to 4 people per case (Handler included) can pin photos, papers and post-its, tie them together with red string, and see each other's changes live from their own phone or laptop.

The whole app is one file: `index.html`.

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

**Saving.** The board saves automatically. Next session, enter the same code and everything is where you left it.

### On the board

The tray at the bottom has five tools.

- **Photo** pins a picture from your phone or computer. Pick a style: **Polaroid**, **Mugshot** (with a booking placard), or **Surveillance** (black-and-white camera still with a timestamp).
- **Paper** pins a **document** (typed page with an optional Classified, Top secret, or Eyes only stamp), a **case card** (a question with notes, one per line), or a **newspaper clipping** (headline and article in columns).
- **Post-it** pins a quick handwritten note in yellow, pink, blue or green.
- **String** ties items together with red string. Tap one item, then the item to tie it to, and keep going until you tap **Done**. Pick red, black, yellow or blue string to color-code leads.
- **Marker** lets you draw on the board: circle a suspect, draw arrows, scrawl a question mark. Choose red or black, use **Undo** for your last line, and tap **Done** to go back to moving things.

Moving around:

- **Drag** anything to move it. Whatever you pick up comes to the front.
- **Tap** an item for Edit, Tie string, or Remove. Double-tap to edit straight away.
- **Tap a string** to cut it, or **tap a marker line** to erase it.
- **Drag the empty wall** to pan, and pinch (phone) or use the mouse wheel (computer) to zoom. **Fit** brings everything back into view.

### Redacting

To redact words on a paper or post-it, select them in the text box and tap **Redact selection**. They show up as black bars on the board. To undo, delete the `[[ ]]` around them.

Redaction is for atmosphere. The original words are still saved behind the scenes, so don't use it to hide real secrets from someone who knows how to dig through a web page.

### Handler controls

In **Case settings**, the Handler can switch the wall between wood panel and cork board for everyone, remove agents, and clear the whole board (items, strings and marker lines). Anyone can turn pin sounds on or off for themselves.
