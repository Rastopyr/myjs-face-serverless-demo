import Ember from "ember";
import { getOwner } from "@ember/application";
import { computed } from "@ember/object";
import Component from "@ember/component";

import styles from "./styles";

let constraints = {
  video: true,
  audio: false
};

export default Component.extend({
  isLoading: false,

  classNames: [styles.container],

  didInsertElement() {
    this.getUserMedia();
  },

  elements: computed(function() {
    let elements = {
      canvas: this.element.querySelector("canvas"),
      video: this.element.querySelector("video"),
      img: this.element.querySelector("img")
    };

    elements.ctx = elements.canvas.getContext("2d");

    return elements;
  }),

  getUserMedia() {
    const { video } = this.get("elements");

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(stream) {
        video.srcObject = stream;
      })
      .catch(function(err) {
        Ember.Logger.error(err);
      });
  },

  makeMagic() {
    const { canvas } = this.get("elements");
    const { urls } = getOwner(this).resolveRegistration("config:environment");

    this.set("isLoading", true);
    this.drawImage();

    return fetch(urls.rekognition, {
      method: "POST",
      body: canvas.toDataURL("image/jpeg")
    })
      .then(r => r.json())
      .then(({ FaceDetails }) => {
        this.drawFaces(FaceDetails);
        this.set("isLoading", false);
      });
  },

  drawImage() {
    const { canvas, video, img, ctx } = this.get("elements");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    img.src = canvas.toDataURL("image/jpeg");

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  },

  drawFaces(faces) {
    const { canvas, ctx } = this.get("elements");

    ctx.strokeStyle = "rgb(220,20,60)";
    ctx.lineWidth = 5;

    faces.forEach(face => {
      const { BoundingBox } = face;

      ctx.strokeRect(
        canvas.width * BoundingBox.Left,
        canvas.height * BoundingBox.Top,
        canvas.width * BoundingBox.Width,
        canvas.height * BoundingBox.Height
      );
    });
  }
});
