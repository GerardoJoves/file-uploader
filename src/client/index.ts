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

Alpine.data('signup', () => ({
  validUsername: false,
  validPassword: false,
  validConfirmPassword: false,

  username: '',
  password: '',
  confirmPassword: '',

  usernameError: '',
  passwordError: '',
  confirmPasswordError: '',

  invalidateUsername() {
    this.validUsername = false;
  },

  invalidatePassword() {
    this.validPassword = false;
  },

  invalidateConfirmPassword() {
    this.validConfirmPassword = false;
  },

  submitDisabled() {
    return (
      !this.validUsername || !this.validPassword || !this.validConfirmPassword
    );
  },

  async validateUsername() {
    this.validUsername = false;
    const username = this.username;
    const length = username.length;
    const regex = /^[a-zA-Z0-9_]+$/;
    if (length < 4 || length > 25) {
      this.usernameError = 'Username must be between 4 and 25 characters.';
    } else if (!regex.test(username)) {
      this.usernameError =
        'Username must contain only alphanumeric characters.';
    } else {
      this.usernameError = '';
      const res = await fetch('/users/check-username?username=' + username);
      const data = (await res.json()) as { available?: boolean };
      if (username != this.username) return;
      if (!data.available) this.usernameError = 'Username is unavailable.';
      else this.validUsername = true;
    }
  },

  validatePassword() {
    this.validPassword = false;
    const length = this.password.length;
    const regex = /^(?=.*\d)(?=.*[a-zA-Z]).+$/;
    if (length < 8) {
      this.passwordError = 'Password must be at least 8 characters long.';
    } else if (length > 30) {
      this.passwordError = 'Password must be shorter than 30 characters.';
    } else if (!regex.test(this.password)) {
      this.passwordError =
        'Password must contain at least one number and one letter.';
    } else {
      this.passwordError = '';
      this.validPassword = true;
    }
    if (this.confirmPassword) this.validateConfirmPassword();
  },

  validateConfirmPassword() {
    this.validConfirmPassword = false;
    if (this.password != this.confirmPassword) {
      this.confirmPasswordError = 'Password confirmation does not match.';
    } else {
      this.confirmPasswordError = '';
      this.validConfirmPassword = true;
    }
  },
}));

Alpine.start();
