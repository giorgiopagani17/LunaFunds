// frontend/src/stores/details.ts
import { defineStore } from 'pinia';

export const useDetailsStore = defineStore('details', {
  state: () => ({
    name: localStorage.getItem('name') || '',
    accountID: localStorage.getItem('accountID') || '',
    groupID: localStorage.getItem('groupID') || '',
    currency: localStorage.getItem('currency') || '',
    groupCurrency: localStorage.getItem('groupCurrency') || '',
    changes: localStorage.getItem('changes') || '',
    cryptoChanges: localStorage.getItem('cryptoChanges') || '',
    groupChanges: localStorage.getItem('groupChanges') || '',
    iban: localStorage.getItem('iban') || '',
  }),
  actions: {
    setDetails(name: string, accountID: string, groupID: string, currency: string, changes: string, iban: string) {
      this.name = name;
      this.accountID = accountID;
      this.groupID = groupID;
      this.currency = currency;
      this.changes = changes;
      this.cryptoChanges = changes;
      this.groupChanges = changes;
      this.iban = iban

      localStorage.setItem('name', name);
      localStorage.setItem('accountID', accountID);
      localStorage.setItem('groupID', groupID);
      localStorage.setItem('currency', currency);
      localStorage.setItem('changes', changes);
      localStorage.setItem('cryptoChanges', changes);
      localStorage.setItem('groupChanges', changes);
      localStorage.setItem('iban', iban);
    },
    clearDetails() {
      this.name = '';
      this.accountID = '';
      this.groupID = '';
      this.currency = '';
      this.groupCurrency = '';
      this.changes = '';
      this.cryptoChanges = '';
      this.groupChanges = '';
      this.iban = '';

      localStorage.removeItem('name');
      localStorage.removeItem('accountID');
      localStorage.removeItem('groupID');
      localStorage.removeItem('currency');
      localStorage.removeItem('groupCurrency');
      localStorage.removeItem('changes');
      localStorage.removeItem('cryptoChanges');
      localStorage.removeItem('groupChanges');
      localStorage.removeItem('iban');
    },

    setAccountID(accountID: string) {
      this.accountID = accountID;
      localStorage.setItem('accountID', accountID); // Ensure localStorage is updated whenever accountID is changed
    },

    setGroupID(groupID: string) {
      this.groupID = groupID;
      localStorage.setItem('groupID', groupID); // Ensure localStorage is updated whenever accountID is changed
    },

    setGroupCurrency(groupCurrency: string) {
      this.groupCurrency = groupCurrency;
      localStorage.setItem('groupCurrency', groupCurrency); // Persist groupCurrency in localStorage
    },

    setCurrency(currency: string) {
      this.currency = currency;
      localStorage.setItem('currency', currency); // Persist groupCurrency in localStorage
    },

    setName(name: string) {
      this.name = name;
      localStorage.setItem('name', name); // Persist groupCurrency in localStorage
    },

    setChanges(changes: string) {
      this.changes = changes;
      localStorage.setItem('changes', changes); // Persist changes in localStorage
    },

    setCryptoChanges(changes: string) {
      this.cryptoChanges = changes;
      localStorage.setItem('cryptoChanges', changes); // Persist changes in localStorage
    },

    setGroupChanges(changes: string) {
      this.groupChanges = changes;
      localStorage.setItem('groupChanges', changes); // Persist changes in localStorage
    },
  },
});
