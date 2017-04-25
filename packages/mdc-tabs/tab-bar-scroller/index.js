/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import MDCComponent from '@material/base/component';

import MDCTabBarScrollerFoundation from './foundation';

export {MDCTabBarScrollerFoundation};

export class MDCTabBarScroller extends MDCComponent {
  static attachTo(root) {
    return new MDCTabBarScroller(root);
  }

  initialize() {
    this.isRTL = false;
    this.currentTranslateOffset_ = 0;
    this.computedFrameWidth_ = 0;
    this.scrollFrame = this.root_.querySelector(MDCTabBarScrollerFoundation.strings.FRAME_SELECTOR);
    this.tabs = this.root_.querySelector(MDCTabBarScrollerFoundation.strings.TABS_SELECTOR);
    this.iterableTabs = [].slice.call(this.root_.querySelectorAll(MDCTabBarScrollerFoundation.strings.TAB_SELECTOR));
    this.shiftBackTarget = this.root_.querySelector(MDCTabBarScrollerFoundation.strings.INDICATOR_BACK_SELECTOR);
    this.shiftForwardTarget = this.root_.querySelector(MDCTabBarScrollerFoundation.strings.INDICATOR_FORWARD_SELECTOR);

    requestAnimationFrame(() => this.layout_());
  }

  getDefaultFoundation() {
    return new MDCTabBarScrollerFoundation({
      isRTL: () =>
        getComputedStyle(this.root_).getPropertyValue('direction') === 'rtl',
      registerBackIndicatorInteractionHandler: (handler) =>
        this.shiftBackTarget.addEventListener('click', handler),
      deregisterBackIndicatorInteractionHandler: (handler) =>
        this.shiftBackTarget.removeEventListener('click', handler),
      registerForwardIndicatorInteractionHandler: (handler) =>
        this.shiftForwardTarget.addEventListener('click', handler),
      deregisterForwardIndicatorInteractionHandler: (handler) =>
        this.shiftForwardTarget.removeEventListener('click', handler),
      registerWindowResizeHandler: (handler) =>
        window.addEventListener('resize', handler),
      deregisterWindowResizeHandler: (handler) =>
        window.removeEventListener('resize', handler),
      triggerNewLayout: () => requestAnimationFrame(() => this.layout_()),
      scrollBack: (isRTL) => this.scrollBack(isRTL),
      scrollForward: (isRTL) => this.scrollForward(isRTL),
    });
  }

  scrollBack(isRTL) {
    let scrollTarget;
    let tabWidthAccumulator = 0;

    this.isRTL = isRTL;

    for (let i = this.iterableTabs.length - 1, tab; tab = this.iterableTabs[i]; i--) {
      const tabOffsetX = this.isRTL ?
        this.getRTLNormalizedOffsetLeftForTab_(tab) : tab.offsetLeft;

      if (tabOffsetX >= this.currentTranslateOffset_) {
        continue;
      }

      tabWidthAccumulator += tab.offsetWidth;

      if (tabWidthAccumulator > this.scrollFrame.offsetWidth) {
        scrollTarget = this.isRTL ?
          this.iterableTabs[this.iterableTabs.indexOf(tab) + 1] :
          this.iterableTabs[this.iterableTabs.indexOf(tab) - 1];
        break;
      }
    }

    if (!scrollTarget) {
      scrollTarget = this.iterableTabs[0];
    }

    this.scrollToTab_(scrollTarget);
  }

  scrollForward(isRTL) {
    let scrollTarget;
    const tabsOffset = this.computedFrameWidth_ + this.currentTranslateOffset_;

    this.isRTL = isRTL;

    for (let i = 0, tab; tab = this.iterableTabs[i]; i++) {
      const tabOffsetX = this.isRTL ?
        this.getRTLNormalizedOffsetLeftForTab_(tab) : tab.offsetLeft;

      if (tabOffsetX + tab.offsetWidth >= tabsOffset) {
        scrollTarget = tab;
        break;
      }
    }

    if (!scrollTarget) {
      return;
    }

    this.scrollToTab_(scrollTarget);
  }

  layout_() {
    this.computedFrameWidth_ = this.scrollFrame.offsetWidth;

    const isOverflowing = this.tabs.offsetWidth > this.computedFrameWidth_;

    if (isOverflowing) {
      this.tabs.classList.add(MDCTabBarScrollerFoundation.cssClasses.VISIBLE);
    } else {
      this.tabs.classList.remove(MDCTabBarScrollerFoundation.cssClasses.VISIBLE);
      this.currentTranslateOffset_ = 0;
      this.shiftFrame_();
    }

    this.updateIndicatorEnabledStates_();
  }

  scrollToTab_(tab) {
    this.currentTranslateOffset_ = this.isRTL ?
      this.tabs.offsetWidth - (tab.offsetLeft + tab.offsetWidth) :
      tab.offsetLeft;
    requestAnimationFrame(() => this.shiftFrame_());
  }

  getRTLNormalizedOffsetLeftForTab_(tab) {
    return this.tabs.offsetWidth - (tab.offsetLeft + tab.offsetWidth);
  }

  shiftFrame_() {
    const shiftAmount = this.isRTL ?
      this.currentTranslateOffset_ : -this.currentTranslateOffset_;

    this.tabs.style.transform =
      this.tabs.style.webkitTransform = `translateX(${shiftAmount}px)`;

    this.updateIndicatorEnabledStates_();
  }

  updateIndicatorEnabledStates_() {
    if (this.currentTranslateOffset_ === 0) {
      this.shiftBackTarget.classList.add(MDCTabBarScrollerFoundation.cssClasses.INDICATOR_DISABLED);
    } else {
      this.shiftBackTarget.classList.remove(MDCTabBarScrollerFoundation.cssClasses.INDICATOR_DISABLED);
    }

    if (this.currentTranslateOffset_ + this.scrollFrame.offsetWidth > this.tabs.offsetWidth) {
      this.shiftForwardTarget.classList.add(MDCTabBarScrollerFoundation.cssClasses.INDICATOR_DISABLED);
    } else {
      this.shiftForwardTarget.classList.remove(MDCTabBarScrollerFoundation.cssClasses.INDICATOR_DISABLED);
    }
  }
}
