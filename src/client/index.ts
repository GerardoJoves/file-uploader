import alpinejs, { Alpine } from 'alpinejs';

type ModalAction =
  | 'createChildFolder'
  | 'uploadFile'
  | 'renameFolder'
  | 'renameFile'
  | 'deleteFolder'
  | 'deleteFile'
  | 'details'
  | 'favoritesAdd'
  | 'favoritesRemove'
  | '';

interface ModalState {
  isOpen: boolean;
  action: ModalAction;
  values: object;
}

const Alpine = alpinejs as unknown as Alpine;

Alpine.store('modal', <ModalState>{
  isOpen: false,
  action: '',
  values: {},

  open(action: ModalAction, values: object = {}) {
    this.isOpen = true;
    this.action = action;
    this.values = values;
  },

  close() {
    this.isOpen = false;
    this.action = '';
    this.values = {};
  },
});

Alpine.start();
