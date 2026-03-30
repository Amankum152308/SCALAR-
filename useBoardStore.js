import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useBoardStore = create(
  immer((set) => ({
    // Global Collections
    boards: [],
    
    // Active Workspace State
    activeBoard: null,
    lists: [],
    cards: {}, // Map of { listId: cardArray } to optimize lookups

    // Extension Mappings
    globalLabels: [],
    globalMembers: [],

    // Search Engine
    searchQuery: '',
    filters: {
      labels: [],
      members: []
    },

    // UI Modals
    activeCardId: null,

    // Actions
    setBoards: (boards) => set((state) => {
      state.boards = boards;
    }),
    
    setActiveBoard: (board) => set((state) => {
      state.activeBoard = board;
      // Initialize the related arrays derived from the unified response if parsed early
      if (board?.lists) {
        state.lists = board.lists;
        // As a placeholder, we might map nested cards sequentially here later.
      }
    }),
    
    setLists: (lists) => set((state) => {
      state.lists = lists;
    }),
    
    setGlobalLabels: (labels) => set((state) => {
      state.globalLabels = labels;
    }),
    
    setGlobalMembers: (members) => set((state) => {
      state.globalMembers = members;
    }),

    setCards: (listId, cards) => set((state) => {
      state.cards[listId] = cards;
    }),

    openCardModal: (cardId) => set((state) => {
      state.activeCardId = cardId;
    }),

    closeCardModal: () => set((state) => {
      state.activeCardId = null;
    }),

    // Search Engine Mutators
    setSearchQuery: (query) => set((state) => {
      state.searchQuery = query;
    }),

    toggleFilterLabel: (labelId) => set((state) => {
      const exists = state.filters.labels.indexOf(labelId);
      if (exists > -1) {
        state.filters.labels.splice(exists, 1);
      } else {
        state.filters.labels.push(labelId);
      }
    }),

    toggleFilterMember: (memberId) => set((state) => {
      const exists = state.filters.members.indexOf(memberId);
      if (exists > -1) {
        state.filters.members.splice(exists, 1);
      } else {
        state.filters.members.push(memberId);
      }
    }),

    clearFilters: () => set((state) => {
      state.searchQuery = '';
      state.filters.labels = [];
      state.filters.members = [];
    }),

    updateCardData: (cardId, payload) => set((state) => {
      const allLists = Object.values(state.cards);
      for (const listCards of allLists) {
        const target = listCards.find(c => c.id === cardId);
        if (target) {
          Object.assign(target, payload);
          break;
        }
      }
    }),

    toggleCardLabel: (cardId, label) => set((state) => {
      const lists = Object.values(state.cards);
      for (const listCards of lists) {
        const target = listCards.find(c => c.id === cardId);
        if (target) {
          target.labels = target.labels || [];
          const exists = target.labels.findIndex(l => l.id === label.id);
          if (exists !== -1) {
            target.labels.splice(exists, 1);
          } else {
            target.labels.push(label);
          }
          break;
        }
      }
    }),

    toggleCardMember: (cardId, member) => set((state) => {
      const lists = Object.values(state.cards);
      for (const listCards of lists) {
        const target = listCards.find(c => c.id === cardId);
        if (target) {
          target.members = target.members || [];
          const exists = target.members.findIndex(m => m.id === member.id);
          if (exists !== -1) {
            target.members.splice(exists, 1);
          } else {
            target.members.push(member);
          }
          break;
        }
      }
    }),

    // Checklist Resolvers
    addCardChecklistItem: (cardId, item) => set((state) => {
      Object.values(state.cards).forEach(listCards => {
        const target = listCards.find(c => c.id === cardId);
        if (target) {
          target.checklists = target.checklists || [];
          target.checklists.push(item);
        }
      });
    }),

    updateCardChecklistItem: (cardId, itemId, payload) => set((state) => {
      Object.values(state.cards).forEach(listCards => {
        const target = listCards.find(c => c.id === cardId);
        if (target) {
          const item = target.checklists?.find(i => i.id === itemId);
          if (item) Object.assign(item, payload);
        }
      });
    }),

    removeCardChecklistItem: (cardId, itemId) => set((state) => {
      Object.values(state.cards).forEach(listCards => {
        const target = listCards.find(c => c.id === cardId);
        if (target && target.checklists) {
          target.checklists = target.checklists.filter(i => i.id !== itemId);
        }
      });
    }),

    // Optimistic Creation Bounds

    addList: (list) => set((state) => {
      state.lists.push(list);
      state.cards[list.id] = [];
    }),

    replaceListTempId: (tempId, realList) => set((state) => {
      const list = state.lists.find(l => l.id === tempId);
      if (list) Object.assign(list, realList);
      
      // Ensure specific keys translate
      state.cards[realList.id] = state.cards[tempId] || [];
      delete state.cards[tempId];
    }),

    removeList: (listId) => set((state) => {
      state.lists = state.lists.filter(l => l.id !== listId);
      delete state.cards[listId];
    }),

    addCard: (listId, card) => set((state) => {
      if (!state.cards[listId]) state.cards[listId] = [];
      state.cards[listId].push(card);
    }),

    replaceCardTempId: (listId, tempId, realCard) => set((state) => {
      // Find the card across all lists in case it was dragged while the request was in flight
      const allLists = Object.values(state.cards);
      for (const listCards of allLists) {
        const card = listCards.find(c => c.id === tempId);
        if (card) {
          // Preserve optimistically modified properties if the card was moved
          Object.assign(card, realCard, {
            list_id: card.list_id !== listId ? card.list_id : realCard.list_id,
            position: card.list_id !== listId ? card.position : realCard.position
          });
          break;
        }
      }
    }),

    removeCard: (listId, cardId) => set((state) => {
      if (state.cards[listId]) {
        state.cards[listId] = state.cards[listId].filter(c => c.id !== cardId);
      }
    }),

    moveList: (sourceIndex, destinationIndex) => set((state) => {
      // Immer allows direct mutative operations masking them immmutably
      const [movedList] = state.lists.splice(sourceIndex, 1);
      state.lists.splice(destinationIndex, 0, movedList);
    }),

    moveCard: (draggableId, source, destination) => set((state) => {
      const sourceListId = source.droppableId;
      const destinationListId = destination.droppableId;
      
      const sourceCards = state.cards[sourceListId] || [];
      const destCards = state.cards[destinationListId] || [];

      if (sourceListId === destinationListId) {
        // Intra-list shifts organically resolving array limits organically
        const [movedCard] = sourceCards.splice(source.index, 1);
        sourceCards.splice(destination.index, 0, movedCard);
      } else {
        // Inter-list drops
        const [movedCard] = sourceCards.splice(source.index, 1);
        movedCard.list_id = destinationListId; // Synchronize relational integrity visually
        
        // Push destination lists strictly
        if (!state.cards[destinationListId]) {
          state.cards[destinationListId] = [];
        }
        state.cards[destinationListId].splice(destination.index, 0, movedCard);
      }
    })
  }))
);

export default useBoardStore;
