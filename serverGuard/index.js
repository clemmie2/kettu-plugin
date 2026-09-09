(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/serverGuard/index.tsx
  var import_react = __toESM(__require("react"), 1);
  var import_react_native = __require("react-native");
  var import_filters = __require("@metro/filters");
  var PLUGIN_NAME = "ServerGuard";
  var DEFAULT_WORDS = "";
  function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
  }
  function matches(value, words) {
    const normalized = normalize(value);
    for (const word of words) {
      if (normalized.includes(normalize(word))) {
        return word;
      }
    }
    return null;
  }
  function getGuildMemberStore() {
    try {
      return (0, import_filters.findByProps)(
        "getMembers",
        "getMember"
      );
    } catch {
      return null;
    }
  }
  function getUserStore() {
    try {
      return (0, import_filters.findByProps)(
        "getUser",
        "getCurrentUser"
      );
    } catch {
      return null;
    }
  }
  function getCurrentGuildId() {
    try {
      const navigation = (0, import_filters.findByProps)(
        "getState",
        "dispatch"
      );
      if (!navigation?.getState) {
        return null;
      }
      const state = navigation.getState();
      const serialized = JSON.stringify(state);
      const match = serialized.match(
        /"guildId":"(\d+)"/
      );
      return match?.[1] ?? null;
    } catch {
      return null;
    }
  }
  function getGuildMembers(guildId) {
    try {
      const store = getGuildMemberStore();
      if (!store) {
        return [];
      }
      const members = store.getMembers?.(guildId);
      if (Array.isArray(members)) {
        return members;
      }
      if (members && typeof members === "object") {
        return Object.values(members);
      }
      return [];
    } catch {
      return [];
    }
  }
  function getUser(userId) {
    try {
      const store = getUserStore();
      return store?.getUser?.(userId) ?? null;
    } catch {
      return null;
    }
  }
  function scanGuild(guildId, words) {
    const results = [];
    const members = getGuildMembers(guildId);
    for (const member of members) {
      const userId = String(
        member?.userId ?? member?.user?.id ?? member?.id ?? ""
      );
      if (!userId) {
        continue;
      }
      const user = getUser(userId);
      if (!user) {
        continue;
      }
      const username = user.username ?? "";
      const displayName = user.globalName ?? user.displayName ?? "";
      const nickname = member.nick ?? "";
      const fields = [
        {
          name: "Username",
          value: username
        },
        {
          name: "Display Name",
          value: displayName
        },
        {
          name: "Nickname",
          value: nickname
        }
      ];
      for (const field of fields) {
        if (!field.value) {
          continue;
        }
        const match = matches(
          field.value,
          words
        );
        if (!match) {
          continue;
        }
        results.push({
          userId,
          username: username || "Unknown User",
          field: field.name,
          value: field.value,
          match
        });
      }
    }
    return results;
  }
  function ResultCard({
    result
  }) {
    return /* @__PURE__ */ import_react.default.createElement(
      import_react_native.View,
      {
        style: {
          padding: 12,
          marginBottom: 10,
          borderRadius: 10,
          backgroundColor: "#202225"
        }
      },
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.Text,
        {
          style: {
            color: "#ffffff",
            fontSize: 16,
            fontWeight: "600"
          }
        },
        result.username
      ),
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.Text,
        {
          style: {
            color: "#b5bac1",
            marginTop: 5
          }
        },
        "User ID: ",
        result.userId
      ),
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.Text,
        {
          style: {
            color: "#b5bac1",
            marginTop: 4
          }
        },
        "Field: ",
        result.field
      ),
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.Text,
        {
          style: {
            color: "#b5bac1",
            marginTop: 4
          }
        },
        "Value: ",
        result.value
      ),
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.Text,
        {
          style: {
            color: "#ffcc66",
            marginTop: 4
          }
        },
        "Match: ",
        result.match
      )
    );
  }
  function ScannerPanel() {
    const [words, setWords] = import_react.default.useState(DEFAULT_WORDS);
    const [results, setResults] = import_react.default.useState([]);
    const [scanning, setScanning] = import_react.default.useState(false);
    const [message, setMessage] = import_react.default.useState(
      "Configure words or phrases, then scan the current server."
    );
    function runScan() {
      setScanning(true);
      setResults([]);
      setMessage("Scanning...");
      try {
        const guildId = getCurrentGuildId();
        if (!guildId) {
          setMessage(
            "Could not determine the current server."
          );
          setScanning(false);
          return;
        }
        const configuredWords = words.split(",").map((word) => word.trim()).filter(Boolean);
        if (configuredWords.length === 0) {
          setMessage(
            "Add at least one word or phrase."
          );
          setScanning(false);
          return;
        }
        const found = scanGuild(
          guildId,
          configuredWords
        );
        setResults(found);
        if (found.length === 0) {
          setMessage(
            "No configured matches found in currently available member data."
          );
        } else {
          setMessage(
            `Found ${found.length} match${found.length === 1 ? "" : "es"}.`
          );
        }
      } catch (error) {
        console.error(
          `[${PLUGIN_NAME}] Scan failed`,
          error
        );
        setMessage(
          "The scan failed. Check the plugin console."
        );
      }
      setScanning(false);
    }
    return /* @__PURE__ */ import_react.default.createElement(
      import_react_native.ScrollView,
      {
        style: {
          flex: 1,
          backgroundColor: "#111214"
        },
        contentContainerStyle: {
          padding: 16
        }
      },
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.Text,
        {
          style: {
            color: "#ffffff",
            fontSize: 24,
            fontWeight: "700",
            marginBottom: 8
          }
        },
        "ServerGuard"
      ),
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.Text,
        {
          style: {
            color: "#b5bac1",
            marginBottom: 18
          }
        },
        "Local server member audit"
      ),
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.Text,
        {
          style: {
            color: "#ffffff",
            fontWeight: "600",
            marginBottom: 8
          }
        },
        "Words / phrases"
      ),
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.TextInput,
        {
          value: words,
          onChangeText: setWords,
          placeholder: "word1, word2, phrase here",
          placeholderTextColor: "#72767d",
          autoCapitalize: "none",
          style: {
            backgroundColor: "#1e1f22",
            color: "#ffffff",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12
          }
        }
      ),
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.TouchableOpacity,
        {
          onPress: runScan,
          disabled: scanning,
          style: {
            backgroundColor: "#5865f2",
            padding: 13,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 12,
            opacity: scanning ? 0.6 : 1
          }
        },
        /* @__PURE__ */ import_react.default.createElement(
          import_react_native.Text,
          {
            style: {
              color: "#ffffff",
              fontWeight: "700"
            }
          },
          scanning ? "Scanning..." : "Scan Current Server"
        )
      ),
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.Text,
        {
          style: {
            color: "#b5bac1",
            marginBottom: 16
          }
        },
        message
      ),
      results.map(
        (result, index) => /* @__PURE__ */ import_react.default.createElement(
          ResultCard,
          {
            key: `${result.userId}-${result.field}-${index}`,
            result
          }
        )
      ),
      /* @__PURE__ */ import_react.default.createElement(
        import_react_native.View,
        {
          style: {
            marginTop: 10,
            padding: 12,
            borderRadius: 8,
            backgroundColor: "#1e1f22"
          }
        },
        /* @__PURE__ */ import_react.default.createElement(
          import_react_native.Text,
          {
            style: {
              color: "#949ba4",
              fontSize: 12,
              lineHeight: 18
            }
          },
          "ServerGuard only scans member information already available to the Discord client. It does not bypass permissions, access hidden channels, or retrieve inaccessible messages."
        )
      )
    );
  }
  var index_default = {
    onLoad() {
      console.log(
        `[${PLUGIN_NAME}] Loaded`
      );
    },
    onUnload() {
      console.log(
        `[${PLUGIN_NAME}] Unloaded`
      );
    },
    settings: {
      get SettingsComponent() {
        return ScannerPanel;
      }
    },
    SettingsComponent: ScannerPanel
  };
})();
