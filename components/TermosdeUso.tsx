// components/SimpleTermsPopup.tsx
import { Modal, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

export default function SimpleTermsPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.title}>Termos de Uso e Consentimento</Text>

            <Text style={styles.text}>
              O ProHealth foi criado para ajudar você a cuidar da sua saúde de forma simples, segura e personalizada. Para isso, coletamos alguns dados pessoais e de saúde com o único objetivo de oferecer uma experiência mais útil e adaptada às suas necessidades.
            </Text>

            <Text style={styles.textBold}>Como usamos seus dados:</Text>
            <Text style={styles.text}>
              • Utilizamos inteligência artificial (IA) para analisar seus dados e gerar insights personalizados, como sugestões de hábitos, práticas saudáveis e consultas médicas;
              {'\n'}• Essa análise é totalmente automatizada, mas não substitui orientação médica. Os resultados são apenas informativos e não constituem diagnóstico, tratamento ou prescrição.
            </Text>

            <Text style={styles.textBold}>Sobre privacidade:</Text>
            <Text style={styles.text}>
              • Nunca vendemos seus dados;
              {'\n'}• Não compartilhamos informações de identificação pessoal com anunciantes ou terceiros, exceto:
              {'\n'}  - Com seu consentimento explícito;
              {'\n'}  - Quando exigido por lei;
            </Text>

            <Text style={styles.text}>
              Você pode, a qualquer momento:
              {'\n'}• Acessar, corrigir ou solicitar a exclusão dos seus dados;
              {'\n'}• Revogar seu consentimento para o uso de IA ou para o tratamento de dados nas configurações do app.
            </Text>

            <Text style={styles.text}>
              Ao usar o app, você confirma que:
              {'\n'}• Tem pelo menos 18 anos;
              {'\n'}• Leu e entendeu como seus dados serão usados;
              {'\n'}• Concorda com estes termos.
            </Text>
          </ScrollView>
        </Pressable>

      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxHeight: '85%',
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F1F1F',
  },
  textBold: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#1F1F1F',
  },
  text: {
    fontSize: 12,
    lineHeight: 20,
    color: '#333',
    marginBottom: 8,
  },
});