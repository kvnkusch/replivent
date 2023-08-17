export type PatchOperation =
  | {
      op: 'put';
      key: string;
      // TODO: Make this generic to the model type?
      value: any;
    }
  | { op: 'del'; key: string }
  | { op: 'clear' };

export type PullResponseOK<Cookie> = {
  cookie: Cookie;
  lastMutationIDChanges: Record<string, number>;
  patch: PatchOperation[];
};
