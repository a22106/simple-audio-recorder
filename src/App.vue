<template>
  <div id="app">
    <div class="audio" id="audio"></div>
    <div v-if="isRecording" class="timer"> {{ elapsedTime }}</div>
    <div class="controls">
      <button
        class="record-btn"
        @click="startRecording"
        :disabled="isRecording"
      >
        Start Recording
      </button>
      <button
        class="stop-btn"
        @click="stopRecording"
        :disabled="!isRecording"
      >
        Stop Recording
      </button>
    </div>
    <div v-if="downloadUrl" class="download-link">
      <a :href="downloadUrl" :download="downloadFileName">Download Recorded Audio</a>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      device: null,
      recorder: null,
      items: [],
      downloadUrl: null,
      downloadFileName: null,
      isRecording: false,
      elapsedTime: "00:00",
      timerInterval: null,
    };
  },
  methods: {
    startRecording() {
      this.device = navigator.mediaDevices.getUserMedia({ audio: true });
      this.device.then((stream) => {
        this.recorder = new MediaRecorder(stream);
        this.recorder.ondataavailable = (e) => {
          this.items.push(e.data);
        };
        this.recorder.start(100);
        this.recorder.onstart = () => {
          this.isRecording = true;
          let startTime = Date.now();

          this.timerInterval = setInterval(() => {
            let elapsedMilliseconds = Date.now() - startTime;
            let elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
            let minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, "0");
            let seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
            this.elapsedTime = `${minutes}:${seconds}`;
          }, 1000);
        };
      });
    },
    stopRecording() {
      if (this.recorder && this.recorder.state === "recording") {
        this.recorder.stop();
        this.recorder.onstop = () => {
          var blob = new Blob(this.items, { type: "audio/webm" });
          var audio = document.getElementById("audio");
          var mainaudio = document.createElement("audio");
          mainaudio.setAttribute("controls", "controls");
          audio.appendChild(mainaudio);
          mainaudio.innerHTML =
            '<source src="' +
            URL.createObjectURL(blob) +
            '" type="audio/webm"/>';

          // Prepare the file for download
          this.prepareDownload(blob);

          // Clear the items array for the next recording
          this.items = [];
          this.isRecording = false;
          clearInterval(this.timerInterval);

          // Stop the audio stream
          if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop()); {
              this.stream = null;
            }
          }
        };
      } else {
        console.warn("Recorder is not currently recording or is inactive.");
      }
    },
    prepareDownload(blob) {
      this.downloadUrl = URL.createObjectURL(blob);
      this.downloadFileName = `recorded_audio_${Date.now()}.webm`;

      // Save the file to the server
      this.saveAudioFile(blob);
    },

    async saveAudioFile(blob) {
      const formData = new FormData();
      formData.append("audio", blob, this.downloadFileName);

      try {
        // Change the URL to the specified IP address of the server
        const response = await axios.post("http://34.64.74.106:3000/api/save-audio", formData);
        console.log(response.data.message);
      } catch (error) {
        console.error("Error saving audio file", error);}
      
    }
  },
};
</script>

<style>
.audio {
  width: 400px;
  height: 600px;
  background-color: #000;
  border-radius: 20px;
  padding: 20px;
  border: 2px solid #757575;
  margin: 50px auto;
}
.audio audio {
  outline: none;
}
.timer {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}
.record-btn,
.stop-btn {
  background-color: #007bff;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.record-btn:hover,
.stop-btn:hover {
  background-color: #0056b3;
}
.download-link {
  text-align: center;
}
</style>