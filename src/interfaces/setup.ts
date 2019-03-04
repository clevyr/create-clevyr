interface Setting {
  name: string;
  default: string | boolean;
  message: string;
  type?: string;
  choices?: string[];
  when?: ((answers: SettingsObject) => boolean);
}

interface SettingsObject {
  [key: string]: string | boolean;
}

export {Setting, SettingsObject};