import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [studySetsCount, setStudySetsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Gebruiker');

        // Load study sets count
        const { count } = await supabase
          .from('study_sets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStudySetsCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/');
    } catch (error) {
      Alert.alert('Fout', 'Kon niet uitloggen');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Laden...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welkom terug,</Text>
        <Text style={styles.userName}>{userName}!</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{studySetsCount}</Text>
          <Text style={styles.statLabel}>Leerlijsten</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Sessies</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Snelle acties</Text>

        <TouchableOpacity style={styles.actionCard}>
          <Link href="/create/leerlijst" asChild>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Nieuwe leerlijst</Text>
              <Text style={styles.actionSubtitle}>Maak flashcards</Text>
            </View>
          </Link>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Link href="/vakken" asChild>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Vakken</Text>
              <Text style={styles.actionSubtitle}>Bekijk je vakken</Text>
            </View>
          </Link>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Link href="/leersets" asChild>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Leerlijsten</Text>
              <Text style={styles.actionSubtitle}>Bekijk je sets</Text>
            </View>
          </Link>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Uitloggen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  welcome: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    width: '100%',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
