import React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wired-button': any;
      'wired-card': any;
      'wired-input': any;
      'wired-checkbox': any;
      'wired-dialog': any;
      'wired-textarea': any;
      'wired-toggle': any;
    }
  }
}