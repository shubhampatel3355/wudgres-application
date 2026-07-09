import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ImageBackground,
  LayoutAnimation,
  UIManager,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme";
import { backgroundImages } from "../data/mockData";
import { supabase } from "../lib/supabase";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.faqContainer}>
      <TouchableOpacity style={styles.faqHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textMuted} />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqBody}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

interface SupportContactScreenProps {
  navigation: any;
}

export const SupportContactScreen: React.FC<SupportContactScreenProps> = ({ navigation }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let userName = "App User";
      let userPhone = "";
      let userEmail = user?.email || "";

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, phone, email')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          userName = profile.name || userName;
          userPhone = profile.phone || userPhone;
          userEmail = profile.email || userEmail;
        }
      }

      const fullMessage = `Subject: ${subject.trim()}\n\n${message.trim()}`;

      const { error } = await supabase
        .from('inquiries')
        .insert({
          name: userName,
          email: userEmail,
          phone: userPhone,
          message: fullMessage,
          status: 'New'
        });

      if (error) throw error;

      Alert.alert("Message Sent", "We have received your message and will get back to you shortly.", [
        { 
          text: "OK", 
          onPress: () => {
            setSubject("");
            setMessage("");
          } 
        }
      ]);
    } catch (err: any) {
      console.error("Error submitting inquiry:", err);
      Alert.alert("Error", "Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "How do I claim my warranty?",
      answer: "You can claim your warranty by visiting the Warranty section in the Wudgres app or contacting our support team with your order ID and product serial number."
    },
    {
      question: "Do you offer installation services?",
      answer: "Yes, we provide professional installation services for our doors and window shutters. You can request installation during checkout."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is dispatched, you will receive a tracking link via email and SMS. You can also view the status in the 'My Orders' section."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 7 days of delivery for defective or damaged products. Please ensure the product is unused and in its original packaging."
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header with Wood Texture Background */}
      <ImageBackground
        source={backgroundImages.woodTexture}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Support & Contact</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Main Content Area (White Card) */}
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.contentCard}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {/* Contact Form Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Send us a message</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="E.g. Order Inquiry"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Message</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput
                    style={styles.textArea}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="How can we help you?"
                    placeholderTextColor="#999"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={theme.colors.textPrimary} />
                ) : (
                  <Text style={styles.submitButtonText}>Send Message</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* FAQ Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </View>

            <View style={styles.contactInfo}>
              <Text style={styles.contactInfoText}>Need immediate help?</Text>
              <Text style={styles.contactInfoValue}>Call us at: +91 98765 43210</Text>
              <Text style={styles.contactInfoValue}>Email: support@wudgres.com</Text>
            </View>
            
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBackground: {
    width: "100%",
    paddingBottom: 40, 
  },
  headerContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Unbounded_700Bold",
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  keyboardView: {
    flex: 1,
  },
  contentCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20, // Overlap the wood background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Extra padding for bottom
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Unbounded_600SemiBold',
    color: theme.colors.textDark,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontFamily: 'Unbounded_500Medium',
    color: theme.colors.textDark,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    height: 56,
  },
  textAreaWrapper: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: theme.fontSize.md,
    fontFamily: 'Unbounded_400Regular',
    color: theme.colors.textDark,
  },
  textArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    fontSize: theme.fontSize.md,
    fontFamily: 'Unbounded_400Regular',
    color: theme.colors.textDark,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#C4A962',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontFamily: 'Unbounded_600SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 24,
  },
  faqContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: theme.borderRadius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontFamily: 'Unbounded_500Medium',
    color: theme.colors.textDark,
    paddingRight: 16,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: theme.fontSize.sm,
    fontFamily: 'Unbounded_400Regular',
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  contactInfo: {
    marginTop: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(196, 169, 98, 0.05)',
    padding: 24,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(196, 169, 98, 0.2)',
  },
  contactInfoText: {
    fontSize: theme.fontSize.md,
    fontFamily: 'Unbounded_600SemiBold',
    color: theme.colors.textDark,
    marginBottom: 8,
  },
  contactInfoValue: {
    fontSize: theme.fontSize.sm,
    fontFamily: 'Unbounded_400Regular',
    color: theme.colors.textMuted,
    marginBottom: 4,
  }
});
