import React from "react";

import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { findByProps } from "@metro/filters";

const PLUGIN_NAME = "ServerGuard";

type ScanResult = {
    userId: string;
    username: string;
    field: string;
    value: string;
    match: string;
};

const DEFAULT_WORDS = "";

function normalize(value: unknown): string {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

function getWords(): string[] {
    return DEFAULT_WORDS
        .split(",")
        .map(word => word.trim())
        .filter(Boolean);
}

function matches(value: string, words: string[]): string | null {
    const normalized = normalize(value);

    for (const word of words) {
        if (normalized.includes(normalize(word))) {
            return word;
        }
    }

    return null;
}

function getGuildMemberStore(): any {
    try {
        return findByProps(
            "getMembers",
            "getMember"
        );
    } catch {
        return null;
    }
}

function getUserStore(): any {
    try {
        return findByProps(
            "getUser",
            "getCurrentUser"
        );
    } catch {
        return null;
    }
}

function getCurrentGuildId(): string | null {
    try {
        const navigation = findByProps(
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

function getGuildMembers(guildId: string): any[] {
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

function getUser(userId: string): any {
    try {
        const store = getUserStore();

        return store?.getUser?.(userId) ?? null;
    } catch {
        return null;
    }
}

function scanGuild(
    guildId: string,
    words: string[]
): ScanResult[] {
    const results: ScanResult[] = [];

    const members = getGuildMembers(guildId);

    for (const member of members) {
        const userId = String(
            member?.userId ??
            member?.user?.id ??
            member?.id ??
            ""
        );

        if (!userId) {
            continue;
        }

        const user = getUser(userId);

        if (!user) {
            continue;
        }

        const username =
            user.username ??
            "";

        const displayName =
            user.globalName ??
            user.displayName ??
            "";

        const nickname =
            member.nick ??
            "";

        const fields = [
            {
                name: "Username",
                value: username,
            },
            {
                name: "Display Name",
                value: displayName,
            },
            {
                name: "Nickname",
                value: nickname,
            },
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
                username:
                    username || "Unknown User",
                field: field.name,
                value: field.value,
                match,
            });
        }
    }

    return results;
}

function ResultCard({
    result,
}: {
    result: ScanResult;
}) {
    return (
        <View
            style={{
                padding: 12,
                marginBottom: 10,
                borderRadius: 10,
                backgroundColor: "#202225",
            }}
        >
            <Text
                style={{
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: "600",
                }}
            >
                {result.username}
            </Text>

            <Text
                style={{
                    color: "#b5bac1",
                    marginTop: 5,
                }}
            >
                User ID: {result.userId}
            </Text>

            <Text
                style={{
                    color: "#b5bac1",
                    marginTop: 4,
                }}
            >
                Field: {result.field}
            </Text>

            <Text
                style={{
                    color: "#b5bac1",
                    marginTop: 4,
                }}
            >
                Value: {result.value}
            </Text>

            <Text
                style={{
                    color: "#ffcc66",
                    marginTop: 4,
                }}
            >
                Match: {result.match}
            </Text>
        </View>
    );
}

function ScannerPanel() {
    const [words, setWords] =
        React.useState(DEFAULT_WORDS);

    const [results, setResults] =
        React.useState<ScanResult[]>([]);

    const [scanning, setScanning] =
        React.useState(false);

    const [message, setMessage] =
        React.useState(
            "Configure words or phrases, then scan the current server."
        );

    function runScan() {
        setScanning(true);
        setResults([]);
        setMessage("Scanning...");

        try {
            const guildId =
                getCurrentGuildId();

            if (!guildId) {
                setMessage(
                    "Could not determine the current server."
                );

                setScanning(false);
                return;
            }

            const configuredWords =
                words
                    .split(",")
                    .map(word => word.trim())
                    .filter(Boolean);

            if (
                configuredWords.length === 0
            ) {
                setMessage(
                    "Add at least one word or phrase."
                );

                setScanning(false);
                return;
            }

            const found =
                scanGuild(
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
                    `Found ${found.length} match${
                        found.length === 1
                            ? ""
                            : "es"
                    }.`
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

    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: "#111214",
            }}
            contentContainerStyle={{
                padding: 16,
            }}
        >
            <Text
                style={{
                    color: "#ffffff",
                    fontSize: 24,
                    fontWeight: "700",
                    marginBottom: 8,
                }}
            >
                ServerGuard
            </Text>

            <Text
                style={{
                    color: "#b5bac1",
                    marginBottom: 18,
                }}
            >
                Local server member audit
            </Text>

            <Text
                style={{
                    color: "#ffffff",
                    fontWeight: "600",
                    marginBottom: 8,
                }}
            >
                Words / phrases
            </Text>

            <TextInput
                value={words}
                onChangeText={setWords}
                placeholder="word1, word2, phrase here"
                placeholderTextColor="#72767d"
                autoCapitalize="none"
                style={{
                    backgroundColor: "#1e1f22",
                    color: "#ffffff",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                }}
            />

            <TouchableOpacity
                onPress={runScan}
                disabled={scanning}
                style={{
                    backgroundColor: "#5865f2",
                    padding: 13,
                    borderRadius: 8,
                    alignItems: "center",
                    marginBottom: 12,
                    opacity: scanning ? 0.6 : 1,
                }}
            >
                <Text
                    style={{
                        color: "#ffffff",
                        fontWeight: "700",
                    }}
                >
                    {scanning
                        ? "Scanning..."
                        : "Scan Current Server"}
                </Text>
            </TouchableOpacity>

            <Text
                style={{
                    color: "#b5bac1",
                    marginBottom: 16,
                }}
            >
                {message}
            </Text>

            {results.map(
                (result, index) => (
                    <ResultCard
                        key={`${result.userId}-${result.field}-${index}`}
                        result={result}
                    />
                )
            )}

            <View
                style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "#1e1f22",
                }}
            >
                <Text
                    style={{
                        color: "#949ba4",
                        fontSize: 12,
                        lineHeight: 18,
                    }}
                >
                    ServerGuard only scans member information
                    already available to the Discord client.
                    It does not bypass permissions, access hidden
                    channels, or retrieve inaccessible messages.
                </Text>
            </View>
        </ScrollView>
    );
}

export default {
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
        },
    },

    SettingsComponent: ScannerPanel,
};