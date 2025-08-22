/**
 * @name PurgeMyMessagesUI
 * @version 1.0.0
 * @description Delete your own messages in a channel/DM using a simple UI.
 */

module.exports = class PurgeMyMessagesUI {
  constructor() {
    this.buttonText = "Purge Messages";
  }

  getName() { return "PurgeMyMessagesUI"; }
  getDescription() { return "Delete your own messages with a UI for channel, age, and keyword."; }
  getVersion() { return "3.0.0"; }
  getAuthor() { return "Blank"; }

  start() {
    this.createUI();
  }

  stop() {
    if (this.container) this.container.remove();
  }

  createUI() {
    const BdApi = window.BdApi;
    const { React, ReactDOM } = BdApi;

    this.container = document.createElement("div");
    this.container.style.padding = "10px";
    this.container.style.background = "#2f3136";
    this.container.style.color = "#fff";

    document.body.appendChild(this.container);

    const App = () => {
      const [channelId, setChannelId] = React.useState("");
      const [daysOld, setDaysOld] = React.useState(0);
      const [keyword, setKeyword] = React.useState("");
      const [status, setStatus] = React.useState("");

      const purgeMessages = async () => {
        setStatus("⏳ Deleting messages...");
        let deletedCount = 0;
        const myId = BdApi.findModuleByProps("getCurrentUser").getCurrentUser().id;
        const now = Date.now();

        try {
          const messages = await BdApi.findModuleByProps("getMessages").getMessages(channelId);

          for (const msg of messages) {
            if (msg.author.id === myId) {
              if (daysOld > 0) {
                const ageMs = now - new Date(msg.timestamp).getTime();
                const daysMs = daysOld * 24 * 60 * 60 * 1000;
                if (ageMs < daysMs) continue;
              }

              if (keyword && !msg.content.includes(keyword)) continue;

              await BdApi.findModuleByProps("deleteMessage").deleteMessage(channelId, msg.id);
              deletedCount++;
              await new Promise(r => setTimeout(r, 500));
            }
          }

          setStatus(`✅ Deleted ${deletedCount} messages.`);
        } catch (err) {
          console.error(err);
          setStatus("❌ Something went wrong.");
        }
      };

      return React.createElement("div", {},
        React.createElement("h3", {}, "Purge Your Messages"),
        React.createElement("input", { placeholder: "Channel ID", value: channelId, onChange: e => setChannelId(e.target.value) }),
        React.createElement("input", { placeholder: "Days old", type: "number", value: daysOld, onChange: e => setDaysOld(e.target.value) }),
        React.createElement("input", { placeholder: "Keyword (optional)", value: keyword, onChange: e => setKeyword(e.target.value) }),
        React.createElement("button", { onClick: purgeMessages }, this.buttonText),
        React.createElement("div", {}, status)
      );
    };

    ReactDOM.render(React.createElement(App), this.container);
  }
};
