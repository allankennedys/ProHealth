import { StyleSheet, Text, View } from 'react-native'

export default function ForgotPassword() {
  return (
    <View style={styles.container}>
      <Text>Esqueci minha senha</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
