import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useFoodLog } from "@/hooks/use-food-log";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import {
  askAI,
  ChatHistoryItem,
  ChatMessage,
  clearChatHistory,
  estimateFood,
  getRemainingMessages,
  isAIAvailable,
  loadChatHistory,
  MAX_MESSAGE_LENGTH,
  saveChatHistory,
} from "@/services/ai-coach";

const SUGGESTIONS = [
  "Give me a workout plan for today",
  "What should I eat to reach my goal?",
  "How can I avoid injuries?",
  "Motivate me!",
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function AICoachScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data } = useOnboarding();
  const { user } = useAuth();
  const { addEntry } = useFoodLog();
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const isLoggedIn = !!user;

  useEffect(() => {
    loadInitialChat();
    refreshRemaining();
  }, []);

  const refreshRemaining = async () => {
    try {
      const count = await getRemainingMessages(isLoggedIn);
      setRemaining(count);
    } catch {}
  };

  const loadInitialChat = async () => {
    const history = await loadChatHistory();
    if (history.length > 0) {
      setMessages(history);
    }
  };

  const scrollToBottom = () => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    );
  };

  const handleSend = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg && lastUserMsg.text === message) {
      toast.show({ message: "You already asked that.", type: "error" });
      return;
    }

    if (!isAIAvailable()) {
      toast.show({
        message: "AI not configured. Add your Gemini API key.",
        type: "error",
      });
      return;
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      text: message,
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const history: ChatHistoryItem[] = messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        text: m.text,
      }));

      const response = await askAI(message, data, history, isLoggedIn);
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: "ai",
        text: response,
        timestamp: Date.now(),
      };
      const withAi = [...updated, aiMsg];
      setMessages(withAi);
      await saveChatHistory(withAi);

      // Try to auto-log food if the message mentions eating
      const foodKeywords =
        /\b(ate|eat|eating|had|consumed|breakfast|lunch|dinner|snack|meal|drank|drink)\b/i;
      if (foodKeywords.test(message)) {
        try {
          const estimate = await estimateFood(message, isLoggedIn);
          if (estimate.calories > 0) {
            await addEntry({
              name: estimate.name,
              calories: estimate.calories,
              protein: estimate.protein,
              carbs: estimate.carbs,
              fat: estimate.fat,
              servingSize: estimate.servingSize,
              source: "ai",
            });
            toast.show({
              message: `Logged ${Math.round(estimate.calories)} kcal for "${estimate.name}"`,
              type: "success",
            });
          }
        } catch {
          // Silent fail - food estimate is optional
        }
      }
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: generateId(),
        role: "ai",
        text: e?.message?.includes("Daily limit")
          ? e.message
          : "Sorry, something went wrong. Please try again.",
        timestamp: Date.now(),
      };

      const isLimitError = e?.message?.includes("Daily limit");
      if (isLimitError && !isLoggedIn) {
        const signInMsg: ChatMessage = {
          id: generateId(),
          role: "ai",
          text: "Sign in to get 20 messages/day and sync your progress across devices!",
          timestamp: Date.now(),
        };
        setMessages([...updated, errMsg, signInMsg]);
      } else {
        setMessages([...updated, errMsg]);
      }
    }

    setLoading(false);
    scrollToBottom();
    refreshRemaining();
  };

  const handleClearChat = async () => {
    await clearChatHistory();
    setMessages([]);
  };

  if (!isAIAvailable()) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContent}>
            <ThemedText style={{ fontSize: 48 }}>🤖</ThemedText>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              FitAI
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptySubtitle}>
              Add your Gemini API key to get started.
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyHint}>
              Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file, then rebuild.
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardAvoid}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              FitAI
            </ThemedText>
            <View style={styles.headerRight}>
              {remaining !== null && (
                <ThemedText
                  type="small"
                  themeColor={remaining <= 3 ? "textSecondary" : "accent"}
                  style={{ fontSize: 12 }}>
                  {remaining} left
                </ThemedText>
              )}
              {messages.length > 0 && (
                <Pressable onPress={handleClearChat} style={styles.clearButton}>
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={{ fontSize: 12 }}
                  >
                    Clear
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </View>

          {!isLoggedIn && (
            <Pressable
              onPress={() => router.push("/auth/login")}
              style={[styles.guestBanner, { backgroundColor: theme.accentBg }]}>
              <ThemedText type="small" style={{ color: theme.accent, fontSize: 13 }}>
                Sign in for 20 messages/day + cloud sync
              </ThemedText>
            </Pressable>
          )}

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && (
              <View style={styles.welcomeSection}>
                <ThemedText type="subtitle" style={styles.welcomeTitle}>
                  Hi{data.username ? ` ${data.username}` : ""}!
                </ThemedText>
                <ThemedText
                  themeColor="textSecondary"
                  style={styles.welcomeSubtitle}
                >
                  I'm your personal fitness assistant. Ask me anything about
                  workouts, nutrition, or motivation.
                </ThemedText>
                <View style={styles.suggestionsGrid}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => handleSend(s)}
                      style={[
                        styles.suggestionPill,
                        {
                          backgroundColor: theme.backgroundElement,
                          borderColor: theme.backgroundSelected,
                        },
                      ]}
                    >
                      <ThemedText type="small" style={{ fontSize: 13 }}>
                        {s}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.role === "user" ? styles.userBubble : styles.aiBubble,
                  {
                    backgroundColor:
                      msg.role === "user"
                        ? theme.accent
                        : theme.backgroundElement,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.messageText,
                    { color: msg.role === "user" ? "#fff" : theme.text },
                  ]}
                >
                  {msg.text}
                </ThemedText>
              </View>
            ))}

            {loading && (
              <View
                style={[
                  styles.messageBubble,
                  styles.aiBubble,
                  { backgroundColor: theme.backgroundElement },
                ]}
              >
                <ThemedText style={styles.messageText}>Thinking...</ThemedText>
              </View>
            )}
          </ScrollView>

          <View
            style={[
              styles.inputRow,
              { borderTopColor: theme.backgroundSelected },
            ]}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.backgroundSelected,
                  },
                ]}
                value={input}
                onChangeText={setInput}
                placeholder="Ask FitAI..."
                placeholderTextColor={theme.textSecondary}
                onSubmitEditing={() => handleSend()}
                returnKeyType="send"
                editable={!loading}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <ThemedText type="small" themeColor="textSecondary" style={styles.charCount}>
                {input.length}/{MAX_MESSAGE_LENGTH}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => handleSend()}
              disabled={!input.trim() || loading}
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.accent,
                  opacity: !input.trim() || loading ? 0.5 : 1,
                },
              ]}
            >
              <ThemedText
                style={{ color: "#fff", fontWeight: "700", fontSize: 20 }}
              >
                ↑
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  keyboardAvoid: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  emptyTitle: {
    fontSize: 24,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyHint: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  headerTitle: {
    fontSize: 20,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  clearButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  guestBanner: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    alignItems: "center",
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  welcomeSection: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.five,
  },
  welcomeTitle: {
    fontSize: 24,
  },
  welcomeSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.three,
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    justifyContent: "center",
  },
  suggestionPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: 1,
  },
  messageBubble: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    maxWidth: "85%",
  },
  userBubble: {
    alignSelf: "flex-end",
  },
  aiBubble: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.half,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
    minHeight: 44,
  },
  charCount: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});