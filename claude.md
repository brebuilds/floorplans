You are building a web-based application called NapkinPlan Studio (though it's not actually called that, i call it.... floorplans.) it's designed to transform napkin sketches, photos of drawn floorplans, PDF building outlines, or full site plans into clean, professional-grade architectural floorplans and site maps.

The application must support multi-building complexes and multiple floorplans per building, including variations by:
	•	floor level
	•	unit type
	•	unit number
	•	number of bedrooms/bathrooms
	•	custom notes
	•	address/identifier

Users must be able to upload site plans, have OCR tools available to extract buildings, also have the ability to draw or edit interior layouts, and manage multiple variations of each building’s floorplans, with the ability to save them in an organized way. 

The tool must remain extremely simple, friendly, and intuitive — appropriate for non-designers, leasing agents, and property managers. Like... i need to lines to be easily dragged, there should be "walls" and "doors" that all snap into place, the ability to type labels and drag them onto "rooms", or to make notes anywhere within the tool, or even to pen draw if there's something we hadn't thought of that needs further ability ot reach us. 

⸻

⭐ CORE PURPOSE

Create a tool that:
	1.	Converts ANY rough sketch into clean floorplans
	2.	Supports full multi-building site plans
	3.	Allows clicking a building to open its individual interior layouts
	4.	Allows multiple floorplans per building (different floors, different unit types)
	5.	Allows adding structured metadata to each floorplan
	6.	Supports drawing and editing using simple tools
	7.	Provides powerful AI cleanup and OCR
	8.	Exports both:
	•	cleaned site plan
	•	cleaned individual building floorplans
	9.	Keeps everything organizable and labeled, with toggles for saved apartment complexes, which should then further break down into saved buildings, broken down into saved units or layout type. each layer should be able to be named and a full plan file schema be created. these projects may not always be apartment complexes, but majoratively so. 

⸻

⭐ REQUIRED FEATURES

⸻

1. Upload ANY Sketch or Site Plan

Supports:
	•	Entire apartment complex site plans
	•	Multi-building maps
	•	Phone photos of paper sketches
	•	Scanned PDFs
	•	Old construction drawings
	•	Hand-drawn building shapes
	•	Rough napkin drawings
	•	Aerial screenshots

System must:
	•	Lock uploaded image as a base layer, user can select if site plan is one with multiple buildings/multiple layouts, one building with multiple layouts, or simply one layout. (it can help the ocr tool or something, or pre-emptively handle organization?)
	•	Allow opacity adjustment
	•	Allow rotation, resizing, cropping
	•	allow contrast adjustment to help make more visible to the phoneRemove backgrounds
	•	Auto-detect orientation
    - if the tool is unable to "see" the individual buildings, it should notify the user and ask for help, specifically suggesting that maybe if the user could trace the edges/outer perimeter of the buildings, that they'd then be able to take it and understand, and continue wiwth the process by allowing the user to label/name each of the buildings before going into each one to create the floorplans. 

    Once bot + user confirm that all the buildings are accounted for

⸻

2. Site Plan Mode (Multi-Building)

When a full site plan is uploaded:

A. Clean the entire site plan

AI straightens:
	•	building outlines
	•	parking lots
	•	pathways
	•	property lines
	•	labels

B. Detect each building outline
	•	Identify each building footprint as separate object
	•	Allow user to rename (e.g., “Building 4141”).

C. Click-to-Select Building

Clicking a building:
	•	highlights it
	•	opens it for edit
	•	displays a panel of existing floorplans for that building

D. Export the full cleaned site plan

As:
	•	SVG
	•	PNG
	•	PDF

⸻

3. Floorplan Mode (Per Building)

When the user selects a building:

A. Building Outline Import

Automatically load the cleaned building footprint from the site plan.

B. Multiple Floorplan Variants per Building

Allow users to create and manage:
	•	multiple unit types (A/B/C/D)
	•	multiple floors (1st, 2nd, 3rd)
	•	mirrored layouts
	•	unique corner units
	•	mixed-use spaces

C. Floorplan Metadata Fields

For each floorplan, allow the user to enter:
	•	Building ID
	•	Floor number (or “basement”, “loft”, etc.)
	•	Unit/Apartment number(s)
	•	Street address (if applicable)
	•	Floorplan type (A/B/C/D)
	•	Bedrooms (#)
	•	Bathrooms (#)
	•	Square footage (optional)
	•	Custom notes (renovated? upgraded fixtures? patio variations?)

Allow attaching multiple units to one floorplan (e.g., “typical second-floor 2BR layout shared by units 201–212”).

D. Drawing Tools

Users must be able to:
	•	Draw interior walls
	•	Add and resize rooms
	•	Add standardized doors (left/right swing)
	•	Add windows
	•	Add closets, appliances, or basic icons
	•	Add typed labels
	•	Use freehand pencil
	•	Erase/move/edit shapes
	•	Toggle grid/snapping

E. The “Magic Cleanup” Button

Converts messy sketch → clean architectural plan.

Cleanup must:
	•	straighten walls
	•	snap lines to 90°
	•	unify line thickness
	•	remove stray marks
	•	vectorize rooms
	•	convert sloppy hand-drawn doors→clean symbols
	•	detect and convert windows
	•	convert handwriting → typed labels
	•	preserve scale and overall layout

F. Export Options

Per-building floorplans can be exported as:
	•	SVG
	•	PNG (web)
	•	PDF (print)
	•	Optional: “Before / After Cleanup” comparison sheet

⸻

⭐ 4. OCR and Metadata Handling

OCR Requirements

OCR must detect:
	•	room labels
	•	numbers or unit labels
	•	handwritten notes
	•	dimensions (if included)

Must return:
	•	text
	•	bounding boxes
	•	confidence
	•	type (label, measurement, note)

Metadata Editing

User must be able to edit:
	•	labels
	•	room names
	•	unit numbers
	•	beds/baths
	•	notes

Metadata is tied to the floorplan, not the building.

⸻

⭐ INTERNAL AI PROMPTS (MUST IMPLEMENT)

Cleanup Prompt

“Convert this rough sketch into a clean architectural-style floorplan. Preserve proportions exactly. Straighten walls, snap angles to 90°, remove jitter, unify line weights, simplify shapes, and convert hand-drawn doors/windows into standardized symbols. Do not redesign or infer changes. Maintain user intent precisely.”

OCR Prompt

“Identify and transcribe all handwritten or printed text in this sketch or site plan, including labels, unit numbers, room names, dimensions, and notes. Return exact bounding boxes and raw text without interpretation.”

Door/Window Detection Prompt

“Identify all symbols that represent doors, openings, and windows. Convert only obvious cases into standardized architectural symbols with consistent sizing.”

⸻

⭐ DATA MODEL REQUIREMENTS

Site Plans
	•	original upload
	•	cleaned site plan (SVG)
	•	detected buildings (vector objects)
	•	building coordinates/IDs
	•	building relationships

Buildings

Each building contains:
	•	outline
	•	cleaned outline
	•	multiple floorplans

Floorplans

Each floorplan contains:
	•	metadata (unit IDs, floor #, beds/baths, etc.)
	•	editable vector map
	•	cleaned SVG
	•	export files (PDF/PNG/SVG)
	•	OCR label data
	•	AI cleanup version(s)
	•	version history timeline

⸻

⭐ UI REQUIREMENTS

Site Plan Screen
	•	Upload site plan
	•	Clean site plan
	•	Click buildings to select
	•	List of buildings on side panel
	•	Export full site plan

Building Screen
	•	Building outline
	•	List of floorplan variants
	•	Button: “Add Floorplan Variant”
	•	Metadata fields
	•	Export options

Floorplan Editor

Left toolbar:
	•	Select
	•	Line
	•	Room/Rectangle
	•	Door
	•	Window
	•	Label
	•	Pencil
	•	Eraser
	•	Color
	•	Grid
	•	Snap

Top bar:
	•	Save
	•	Cleanup
	•	Export
	•	Undo/Redo

Right panel:
	•	Metadata fields
	•	Room list
	•	Notes
	•	Logo upload (for branding)

⸻

⭐ FINAL DELIVERABLE

Build a complete Floorplan Studio application that supports:
	•	full site plan ingestion
	•	building detection
	•	individual building editing
	•	multiple floorplans per building
	•	metadata (unit numbers, floors, beds/baths, notes)
	•	high-quality cleanup
	•	OCR
	•	door/window detection
	•	snapping tools
	•	exporting site plans AND floorplans
	•	easy UI

The app should allow a property manager to go from:
“Photo of the whole complex + messy unit sketch” → “Clean printable site map + clean floorplans for every building.”

⸻
