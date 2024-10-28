import alpinejs, { Alpine } from 'alpinejs';

type ModalOperation =
  | 'createChildFolder'
  | 'uploadFile'
  | 'renameFolder'
  | 'renameFile'
  | 'deleteFolder'
  | 'deleteFile'
  | 'details'
  | '';

interface ModalState {
  isOpen: boolean;
  endpoint?: string;
  operation: ModalOperation;
  values: object;
}

interface ModalOpenParams {
  operation: ModalOperation;
  endpoint?: string;
  values?: object;
}

const Alpine = alpinejs as unknown as Alpine;

Alpine.store('modal', <ModalState>{
  isOpen: false,
  operation: '',
  values: {},

  open({ operation, endpoint, values }: ModalOpenParams) {
    this.isOpen = true;
    this.operation = operation;
    this.endpoint = endpoint;
    this.values = values || {};
  },

  close() {
    this.isOpen = false;
    this.endpoint = '';
    this.operation = '';
    this.values = {};
  },
});

Alpine.start();
