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

- **Photo, Paper, Post-it** in the bottom tray add items. New items appear near the middle of your screen.
- **Drag** anything to move it. Whatever you pick up comes to the front.
- **Tap** an item for Edit, Tie string, or Remove. Double-tap to edit straight away.
- **Tie string:** tap an item, tap **Tie string**, then tap the item to connect it to.
- **Cut string:** tap a string, then tap **Cut string**.
- **Move around:** drag the empty wall to pan, and pinch (phone) or use the mouse wheel (computer) to zoom. **Fit** brings everything back into view.

### Papers

Papers come in two styles: a **typed document** (title and text) or a **case card** (a question or heading with notes, one per line). Either can get a Classified, Top secret, or Eyes only stamp.

To redact words, select them in the text box and tap **Redact selection**. They show up as black bars on the board. To undo, delete the `[[ ]]` around them.

Redaction is for atmosphere. The original words are still saved behind the scenes, so don't use it to hide real secrets from someone who knows how to dig through a web page.

### Handler controls

In **Case settings**, the Handler can switch the wall between wood panel and cork board for everyone, remove agents, and clear the whole board. Anyone can turn pin sounds on or off for themselves.
