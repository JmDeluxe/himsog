import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import {
  askAI,
  isAIAvailable,
  ChatMessage,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
} from '@/services/ai-coach';

const SUGGESTIONS = [
  'Give me a workout plan for today',
  'What should I eat to reach my goal?',
  'How can I avoid injuries?',
  'Motivate me!',
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function AICoachScreen() {
  const theme = useTheme();
  const { data } = useOnboarding();
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadInitialChat();
  }, []);

  const loadInitialChat = async () => {
    const history = await loadChatHistory();
    if (history.length > 0) {
      setMessages(history);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    if (!isAIAvailable()) {
      toast.show({ message: 'AI not configured. Add your Gemini API key.', type: 'error' });
      return;
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      text: message,
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const response = await askAI(message, data);
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        text: response,
        timestamp: Date.now(),
      };
      const withAi = [...updated, aiMsg];
      setMessages(withAi);
      await saveChatHistory(withAi);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        text: 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      };
      const withErr = [...updated, errMsg];
      setMessages(withErr);
    }

    setLoading(false);
    scrollToBottom();
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
            <ThemedText type="subtitle" style={styles.emptyTitle}>FitAI</ThemedText>
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
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={0}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.headerTitle}>FitAI</ThemedText>
            {messages.length > 0 && (
              <Pressable onPress={handleClearChat} style={styles.clearButton}>
                <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                  Clear
                </ThemedText>
              </Pressable>
            )}
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled">
            {messages.length === 0 && (
              <View style={styles.welcomeSection}>
                <ThemedText style={{ fontSize: 48 }}>🏋️</ThemedText>
                <ThemedText type="subtitle" style={styles.welcomeTitle}>
                  Hi{data.username ? ` ${data.username}` : ''}!
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.welcomeSubtitle}>
                  I'm your personal fitness assistant. Ask me anything about workouts, nutrition, or motivation.
                </ThemedText>
                <View style={styles.suggestionsGrid}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => handleSend(s)}
                      style={[styles.suggestionPill, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
                      <ThemedText type="small" style={{ fontSize: 13 }}>{s}</ThemedText>
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
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                  { backgroundColor: msg.role === 'user' ? theme.accent : theme.backgroundElement },
                ]}>
                <ThemedText
                  style={[
                    styles.messageText,
                    { color: msg.role === 'user' ? '#fff' : theme.text },
                  ]}>
                  {msg.text}
                </ThemedText>
              </View>
            ))}

            {loading && (
              <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={styles.messageText}>Thinking...</ThemedText>
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputRow, { borderTopColor: theme.backgroundSelected }]}>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.backgroundSelected }]}
              value={input}
              onChangeText={setInput}
              placeholder="Ask FitAI..."
              placeholderTextColor={theme.textSecondary}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              editable={!loading}
            />
            <Pressable
              onPress={() => handleSend()}
              disabled={!input.trim() || loading}
              style={[styles.sendButton, { backgroundColor: theme.accent, opacity: !input.trim() || loading ? 0.5 : 1 }]}>
              <ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>↑</ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  emptyTitle: {
    fontSize: 24,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyHint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  headerTitle: {
    fontSize: 20,
  },
  clearButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
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
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.five,
  },
  welcomeTitle: {
    fontSize: 24,
  },
  welcomeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.three,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
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
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.two,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});