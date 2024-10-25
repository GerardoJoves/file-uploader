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
  submitted: false;
  isOpen: boolean;
  endpoint: string;
  operation: ModalOperation;
  values: object;
}

const Alpine = alpinejs as unknown as Alpine;

Alpine.store('modal', <ModalState>{
  submitted: false,
  isOpen: false,
  endpoint: '',
  operation: '',
  values: {},

  open(operation: ModalOperation, endpoint: string, values?: object) {
    this.isOpen = true;
    this.operation = operation;
    this.endpoint = endpoint;
    if (values) this.values = values;
  },

  close() {
    this.submitted = false;
    this.isOpen = false;
    this.endpoint = '';
    this.operation = '';
    this.values = {};
  },
});

Alpine.start();
