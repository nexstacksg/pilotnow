import * as React from 'react';

/**
 * Multiline text input — same chrome as Input, vertically resizable.
 */
export interface TextareaProps {
  label?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  /** @default 4 */
  rows?: number;
  hint?: React.ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export declare function Textarea(props: TextareaProps): JSX.Element;
