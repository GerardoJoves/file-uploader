import alpinejs, { Alpine } from 'alpinejs';

type ModalOperation =
  | 'createChildFolder'
  | 'uploadFile'
  | 'renameFolder'
  | 'renameFile'
  | 'deleteFolder'
  | 'deleteFile'
  | '';

interface ModalState {
  isOpen: boolean;
  endpoint: string;
  operation: ModalOperation;
  values: object;
}

const Alpine = alpinejs as unknown as Alpine;

Alpine.store('modal', <ModalState>{
  isOpen: false,
  endpoint: '',
  operation: '',
  values: {},

  open(operation: ModalOperation, endpoint: string, values: object = {}) {
    this.isOpen = true;
    this.operation = operation;
    this.endpoint = endpoint;
    this.values = values;
  },

  close() {
    this.isOpen = false;
    this.endpoint = '';
    this.operation = '';
    this.values = {};
  },
});

Alpine.start();
