# Architecture.md — System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              React.js / Next.js SPA                     │   │
│   │                                                         │   │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │   │
│   │   │  Board   │  │  List    │  │   Card Detail     │    │   │
│   │   │  View    │  │  Column  │  │   Modal           │    │   │
│   │   └──────────┘  └──────────┘  └──────────────────┘    │   │
│   │                                                         │   │
│   │   ┌─────────────────────────────────────────────────┐  │   │
│   │   │         State Management (Zustand / Redux)       │  │   │
│   │   └─────────────────────────────────────────────────┘  │   │
│   │                                                         │   │
│   │   ┌─────────────────────────────────────────────────┐  │   │
│   │   │              API Service Layer (Axios)           │  │   │
│   │   └─────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Server                           │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │            Node.js + Express.js                         │   │
│   │                                                         │   │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│   │   │  Routes  │→ │ Controllers│→│ Services │            │   │
│   │   └──────────┘  └──────────┘  └──────────┘            │   │
│   │                                      │                  │   │
│   │                              ┌───────▼───────┐         │   │
│   │                              │  Data Access  │         │   │
│   │                              │  Layer (ORM)  │         │   │
│   │                              └───────────────┘         │   │
│   └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│                                                                 │
│   boards → lists → cards → labels / checklists / members       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Tree

```
App
├── BoardsPage           ← lists all boards (bonus: multiple boards)
│   └── BoardCard
└── BoardPage            ← main workspace
    ├── BoardHeader      ← title, filter, search bar
    ├── BoardCanvas      ← horizontally scrollable list container
    │   ├── ListColumn   ← one column per list
    │   │   ├── ListHeader (editable title, delete)
    │   │   ├── CardItem (draggable card)
    │   │   │   └── CardLabels / CardMeta
    │   │   └── AddCardButton
    │   └── AddListButton
    └── CardDetailModal  ← opens on card click
        ├── CardTitle
        ├── CardDescription
        ├── LabelPicker
        ├── DueDatePicker
        ├── MemberAssigner
        └── ChecklistSection
            └── ChecklistItem
```

### State Management

```
Global Store
├── boards[]          ← list of all boards
├── activeBoardId     ← currently viewed board
├── lists[]           ← ordered lists for active board
├── cards{}           ← map of listId → cards[]
├── members[]         ← all available members
├── labels[]          ← label definitions
└── ui
    ├── activeCardId  ← card detail modal
    ├── searchQuery
    └── activeFilters { labels, members, dueDate }
```

### Data Flow

```
User Action
    │
    ▼
UI Component
    │  dispatches
    ▼
Store Action / Mutation
    │  optimistic update (UI updates immediately)
    │
    ├──► API Service (async)
    │        │
    │        ▼
    │    Backend API
    │        │
    │        ▼ success / error
    │    Confirm or Rollback state
    ▼
Re-render
```

---

## Backend Architecture

### Layered Structure

```
Request → Router → Controller → Service → Repository → Database
                                    ↕
                              Validation / DTOs
```

| Layer | Responsibility |
|-------|----------------|
| **Router** | Define HTTP routes and attach middleware |
| **Controller** | Parse request, call service, send response |
| **Service** | Business logic (ordering, validation rules) |
| **Repository** | Database queries (raw SQL or ORM) |
| **Middleware** | Error handling, request logging, CORS |

### REST API Surface

| Resource | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| Boards | GET | `/api/boards` | List all boards |
| Boards | POST | `/api/boards` | Create board |
| Boards | GET | `/api/boards/:id` | Get board with lists & cards |
| Boards | PATCH | `/api/boards/:id` | Update board title/background |
| Lists | POST | `/api/lists` | Create list |
| Lists | PATCH | `/api/lists/:id` | Update list title or position |
| Lists | DELETE | `/api/lists/:id` | Delete list |
| Lists | PATCH | `/api/lists/reorder` | Bulk reorder lists |
| Cards | POST | `/api/cards` | Create card |
| Cards | GET | `/api/cards/:id` | Get card detail |
| Cards | PATCH | `/api/cards/:id` | Update card fields |
| Cards | DELETE | `/api/cards/:id` | Archive/delete card |
| Cards | PATCH | `/api/cards/reorder` | Reorder/move cards |
| Labels | GET | `/api/labels` | List all labels |
| Labels | POST | `/api/cards/:id/labels` | Attach label to card |
| Labels | DELETE | `/api/cards/:id/labels/:labelId` | Remove label from card |
| Members | GET | `/api/members` | List all members |
| Members | POST | `/api/cards/:id/members` | Assign member to card |
| Members | DELETE | `/api/cards/:id/members/:memberId` | Unassign member |
| Checklist | POST | `/api/cards/:id/checklist` | Add checklist item |
| Checklist | PATCH | `/api/checklist/:itemId` | Toggle/edit item |
| Checklist | DELETE | `/api/checklist/:itemId` | Delete item |
| Search | GET | `/api/search?q=&labels=&members=&due=` | Search & filter cards |

---

## Database Schema

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    boards    │       │    lists     │       │      cards       │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ id (PK)      │──┐    │ id (PK)      │──┐    │ id (PK)          │
│ title        │  └──► │ board_id (FK)│  └──► │ list_id (FK)     │
│ background   │       │ title        │       │ title            │
│ created_at   │       │ position     │       │ description      │
└──────────────┘       │ created_at   │       │ position         │
                       └──────────────┘       │ due_date         │
                                              │ is_archived      │
                                              │ cover_image      │
                                              │ created_at       │
                                              └──────────────────┘
                                                       │
             ┌─────────────────────────────────────────┤
             │                    │                    │
             ▼                    ▼                    ▼
  ┌────────────────┐   ┌─────────────────┐   ┌───────────────────┐
  │  card_labels   │   │ card_members    │   │  checklist_items  │
  ├────────────────┤   ├─────────────────┤   ├───────────────────┤
  │ card_id (FK)   │   │ card_id (FK)    │   │ id (PK)           │
  │ label_id (FK)  │   │ member_id (FK)  │   │ card_id (FK)      │
  └────────────────┘   └─────────────────┘   │ text              │
           │                    │             │ is_complete       │
           ▼                    ▼             │ position          │
  ┌────────────────┐   ┌─────────────────┐   └───────────────────┘
  │    labels      │   │    members      │
  ├────────────────┤   ├─────────────────┤
  │ id (PK)        │   │ id (PK)         │
  │ name           │   │ name            │
  │ color          │   │ avatar_url      │
  └────────────────┘   │ initials        │
                       └─────────────────┘
```

---

## Drag-and-Drop Architecture

The DnD system uses **@hello-pangea/dnd** (maintained fork of react-beautiful-dnd).

```
<DragDropContext onDragEnd={handleDragEnd}>

  {/* Lists are droppable horizontally */}
  <Droppable droppableId="board" direction="horizontal" type="LIST">
    {lists.map((list, index) => (

      <Draggable draggableId={list.id} index={index} type="LIST">
        <ListColumn>

          {/* Cards are droppable vertically within each list */}
          <Droppable droppableId={list.id} type="CARD">
            {cards[list.id].map((card, i) => (
              <Draggable draggableId={card.id} index={i} type="CARD">
                <CardItem />
              </Draggable>
            ))}
          </Droppable>

        </ListColumn>
      </Draggable>

    ))}
  </Droppable>

</DragDropContext>
```

### `handleDragEnd` Logic

```
if (type === "LIST"):
  → reorder lists[] array in state
  → PATCH /api/lists/reorder with new positions

if (type === "CARD"):
  → same list: reorder cards within list
  → different list: move card to new list + reorder
  → PATCH /api/cards/reorder with { cardId, newListId, newPosition }
```

---

## Deployment Architecture

```
Vercel (Frontend)          Render / Railway (Backend)
─────────────────          ──────────────────────────
Next.js / React    ──►     Express.js API
Static CDN                       │
                           PostgreSQL (Render DB
                           or Supabase / Neon)
```

Environment variables are managed via `.env` on the backend and `NEXT_PUBLIC_*` on the frontend.
