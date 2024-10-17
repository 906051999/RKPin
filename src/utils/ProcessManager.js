class ProcessManager {
  constructor() {
    this.processes = new Map();
  }

  startProcess(channelUrl, process) {
    if (this.processes.has(channelUrl)) {
      this.cancelProcess(channelUrl);
    }
    this.processes.set(channelUrl, process);
  }

  cancelProcess(channelUrl) {
    const process = this.processes.get(channelUrl);
    if (process && typeof process.cancel === 'function') {
      process.cancel();
    }
    this.processes.delete(channelUrl);
  }

  cancelAllProcesses() {
    for (const [channelUrl] of this.processes) {
      this.cancelProcess(channelUrl);
    }
  }
}

export default new ProcessManager();
