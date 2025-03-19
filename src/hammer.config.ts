import { Injectable } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  override overrides = {
    swipe: { velocity: 0.4, threshold: 20 } // Adjust these values as needed
  };
}