import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Leersets() {
  const [studySets, setStudySets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadStudySets();
  }, []);

  const loadStudySets = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('study_sets')
        .select('*, subjects(name)')
        .eq('user_id', user.id);

      if (error) throw error;
      setStudySets(data || []);
    } catch (error) {
      console.error('Error loading study sets:', error);
      Alert.alert('Fout', 'Kon leerlijsten niet laden');
    } finally {
      setLoading(false);
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Terug</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leerlijsten</Text>
      </View>

      {studySets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nog geen leerlijsten</Text>
          <Text style={styles.emptySubtext}>Maak je eerste leerlijst aan</Text>
        </View>
      ) : (
        <View style={styles.setsList}>
          {studySets.map((set) => (
            <TouchableOpacity
              key={set.id}
              style={styles.setCard}
              onPress={() => router.push(`/study/${set.id}`)}
            >
              <Text style={styles.setTitle}>{set.name}</Text>
              <Text style={styles.setDescription}>{set.description || 'Geen beschrijving'}</Text>
              <View style={styles.setMeta}>
                <Text style={styles.cardCount}>{set.card_count || 0} kaarten</Text>
                {set.subjects && <Text style={styles.subjectName}>{set.subjects.name}</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.addButton}>
        <Link href="/create/leerlijst" asChild>
          <Text style={styles.addButtonText}>+ Nieuwe leerlijst</Text>
        </Link>
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
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#3b82f6',
    position: 'absolute',
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  setsList: {
    padding: 20,
  },
  setCard: {
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
  setTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  setDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  setMeta: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 15,
  },
  cardCount: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  subjectName: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  addButton: {
    margin: 20,
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
