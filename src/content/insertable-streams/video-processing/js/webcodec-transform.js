/*
 *  Copyright (c) 2021 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

/**
 * Encodes and decodes frames using the WebCodec API.
 * @implements {FrameTransform} in pipeline.js
 */
class WebCodecTransform { // eslint-disable-line no-unused-vars
  constructor() {
    // Encoder and decoder are initialized in init()
    this.decoder_ = null;
    this.encoder_ = null;
    this.controller_ = null;

    /** TODO(riju) : Put up multiple filters */
    this.filter_brightness_ = null;
    /**
    this.filter_contrast_ = null;
    this.filter_hue_ = null;
    this.filter_saturation_ = null;
    this.filter_whitebalance_ = null;
    //this.filter_colorspaceconversion_ = null;
    this.filter_denoise_ = null;
    **/
this.frame_count_ = 0;
this.start_time_ = false;
  }

  /** @override */
  async init() {
    console.log('[WebCodecTransform] Initializing encoder and decoder');
    this.decoder_ = new VideoDecoder({
      output: frame => this.handleDecodedFrame(frame),
      error: this.error
    });
    this.encoder_ = new VideoEncoder({
      output: frame => this.handleEncodedFrame(frame),
      error: this.error
    });
    this.filter_brightness_ = new VideoFilter({
      output: frame => this.handleFilteredFrame(frame),
      error: this.error
    });

    /**
    this.filterContrast_ = new VideoFilter({
      output: frame => this.handleFilteredFrame(frame),
      error: this.error
    });

    this.filterHue_ = new VideoFilter({
      output: frame => this.handleFilteredFrame(frame),
      error: this.error
    });

    this.filterSaturation_ = new VideoFilter({
      output: frame => this.handleFilteredFrame(frame),
      error: this.error
    });

    this.filterWhitebalance_ = new VideoFilter({
      output: frame => this.handleFilteredFrame(frame),
      error: this.error
    });

    this.filterDenoise_ = new VideoFilter({
      output: frame => this.handleFilteredFrame(frame),
      error: this.error
    });
  */

    this.encoder_.configure({codec: 'vp8', hardwareAcceleration: 'prefer-software', width: 640, height: 480});
    this.decoder_.configure({codec: 'vp8', hardwareAcceleration: 'prefer-software', width: 640, height: 480});

  /** TODO(riju) : Put up multiple filters */
  // console.log ("Riju : ", parseInt(document.querySelector("#brightnessSliderValue")));
    this.filter_brightness_.configure({filter: 'brightness', codedWidth: 720, codedHeight: 576 });
  /*
    this.filter_contrast_.configure({filter: 'contrast', width: 640, height: 480, strength: 0.5 });
    this.filter_hue_.configure({filter: 'hue', width: 640, height: 480, strength: 0.5 });
    this.filter_saturation_.configure({filter: 'saturation', width: 640, height: 480, strength: 0.5 });
    this.filter_whitebalance_.configure({filter: 'whitebalance', width: 640, height: 480, strength: 0.5 });
    this.filter_denoise_.configure({filter: 'denoise', width: 640, height: 480, strength: 0.5 });
  */
  }

  /** @override */
  async transform(frame, controller) {
    if (!this.filter_brightness_) {
      frame.close();
      return;
    }
    try {
      this.controller_ = controller;
      this.filter_brightness_.filter(frame);
    } finally {
      frame.close();
    }
  }

  /** @override */
  updateSettings(newSettings) {}

  /** @override */
  destroy() {}

  /* Helper functions */
  handleEncodedFrame(encodedFrame) {
    this.decoder_.decode(encodedFrame);
  }

  handleDecodedFrame(videoFrame) {
    if (!this.controller_) {
      videoFrame.close();
      return;
    }
    this.controller_.enqueue(videoFrame);
  }

  // TODO(riju) : Do nothing now.
  handleFilteredFrame(videoFrame) {
    if (!this.controller_) {
      videoFrame.close();
      return;
    }
    this.controller_.enqueue(videoFrame);
const width = videoFrame.displayWidth;
const height = videoFrame.displayHeight;
const date = new Date();
let time = date.getTime();
if (!this.start_time_) {
        this.start_time_ = time;
}
time -= this.start_time_;
if ((this.frame_count_ % 10) == 0) {
        console.log('VideoFilter Got filtered frame #' + this.frame_count_ + ' @ ' +
                    time + ' ms, ' + time/this.frame_count_ + ' ms/frame ' +
		    'size ' + width + 'x' + height);
}
this.frame_count_++;

  }

  error(e) {
    console.log('[WebCodecTransform] Bad stuff happened: ' + e);
  }
}
