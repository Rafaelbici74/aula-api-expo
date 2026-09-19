import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import globalStyles from '../../../stylesGlobal';
import AppHeader from '../../../components/AppHeader';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { profileApi } from '../../../services/profileApi';
import { ibgeApi } from '../../../services/ibgeApi';
import styles from './styles';

export default function Perfil() {
  const { theme } = useTheme();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [locationPart, setLocationPart] = useState('pais');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationDraft, setLocationDraft] = useState({
    pais: 'Brasil',
    estado: null,
    cidade: null,
  });
  const [saving, setSaving] = useState(false);

  function formatLocation(value) {
    if (!value) return '';
    try {
      const parsed = JSON.parse(value);
      return `${parsed.cidade}, ${parsed.uf || parsed.estado}, ${parsed.pais}`;
    } catch {
      return value;
    }
  }

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    Promise.all([profileApi.buscar(user.id), profileApi.buscarAvaliacao(user.id)])
      .then(([profileResponse, ratingResponse]) => {
        setProfile({
          ...profileResponse.dados,
          nome: profileResponse.dados?.nome || user.nome || '',
        });
        setRating(ratingResponse.dados || null);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  function openBio() {
    setBioDraft(profile?.bio || '');
    setBioModalVisible(true);
  }

  async function openLocation() {
    setLocationModalVisible(true);
    setLocationPart('estado');
    setLocationSearch('');
    setStatesLoading(true);
    try {
      const estados = await ibgeApi.listarEstados();
      setStates(estados);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setStatesLoading(false);
    }
  }

  async function selectState(estado) {
    setLocationDraft((current) => ({ ...current, estado, cidade: null }));
    setCities([]);
    setLocationPart('cidade');
    setLocationSearch('');
    setCitiesLoading(true);
    try {
      setCities(await ibgeApi.listarCidades(estado.id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCitiesLoading(false);
    }
  }

  async function saveBio() {
    setSaving(true);
    try {
      const response = await profileApi.atualizarBio(user.id, bioDraft);
      setProfile(response.dados);
      setUser(response.dados);
      setBioModalVisible(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveLocation() {
    if (!locationDraft.estado || !locationDraft.cidade) {
      setError('Selecione o estado e a cidade.');
      return;
    }

    const localizacao = JSON.stringify({
      pais: locationDraft.pais,
      estado: locationDraft.estado.nome,
      estadoId: locationDraft.estado.id,
      uf: locationDraft.estado.sigla,
      cidade: locationDraft.cidade.nome,
      cidadeId: locationDraft.cidade.id,
    });
    setSaving(true);
    try {
      const response = await profileApi.atualizarLocalizacao(user.id, localizacao);
      setProfile(response.dados);
      setUser(response.dados);
      setLocationModalVisible(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={[globalStyles.screen, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <AppHeader title="Perfil" />

      <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.primaryDark }]}>
        <Image
          source={require('../../../../assets/icon.png')}
          style={styles.photo}
          accessibilityLabel="Foto do usuário"
        />
        <Text style={[styles.name, { color: theme.text }]}>
          {loading ? 'Carregando...' : profile?.nome || user?.nome || 'Nome não informado'}
        </Text>
        <Text style={[styles.email, { color: theme.mutedText }]}>{profile?.email || ''}</Text>
        {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}
        <View style={styles.infoBlock}>
          <Text style={[styles.label, { color: theme.primaryDark }]}>Avaliação</Text>
          {Number(rating?.total || 0) > 0 ? (
            <>
              <Text style={[styles.ratingValue, { color: theme.text }]}>
                ★ {Number(rating.media).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.value, { color: theme.mutedText }]}>
                {rating.total} {Number(rating.total) === 1 ? 'avaliação' : 'avaliações'}
              </Text>
            </>
          ) : (
            <Text style={[styles.value, { color: theme.mutedText }]}>Ainda não recebeu avaliações.</Text>
          )}
        </View>
        <View style={styles.infoBlock}>
          <Text style={[styles.label, { color: theme.primaryDark }]}>Bio</Text>
          <Text style={[styles.value, { color: theme.mutedText }]}>{profile?.bio || 'Nenhuma bio adicionada.'}</Text>
          <Pressable style={[styles.secondaryButton, { borderColor: theme.primary }]} onPress={openBio}>
            <Text style={[styles.secondaryButtonText, { color: theme.primaryDark }]}>
              {profile?.bio ? 'Editar Bio' : 'Adicionar Bio'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.infoBlock}>
          <Text style={[styles.label, { color: theme.primaryDark }]}>Localização</Text>
          <Text style={[styles.value, { color: theme.mutedText }]}>
            {formatLocation(profile?.localizacao) || 'Nenhuma localização adicionada.'}
          </Text>
          <Pressable style={[styles.secondaryButton, { borderColor: theme.primary }]} onPress={openLocation}>
            <Text style={[styles.secondaryButtonText, { color: theme.primaryDark }]}>Editar Localização</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={bioModalVisible} transparent animationType="fade" onRequestClose={() => setBioModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Bio</Text>
            <TextInput
              multiline
              maxLength={1000}
              value={bioDraft}
              onChangeText={setBioDraft}
              placeholder="Escreva uma breve apresentação"
              placeholderTextColor={theme.placeholder}
              style={[styles.bioInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setBioModalVisible(false)} disabled={saving}>
                <Text style={[styles.cancelText, { color: theme.mutedText }]}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={saveBio} disabled={saving}>
                <Text style={[styles.saveText, { color: theme.primary }]}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={locationModalVisible} transparent animationType="fade" onRequestClose={() => setLocationModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Localização</Text>
            <Text style={[styles.locationStep, { color: theme.mutedText }]}>
              {locationPart === 'estado' ? 'Selecione um estado (UF)' : 'Selecione uma cidade'}
            </Text>
            {locationPart !== 'selected' ? (
              <TextInput
                value={locationSearch}
                onChangeText={setLocationSearch}
                placeholder={locationPart === 'estado' ? 'Pesquisar estado ou UF' : 'Pesquisar cidade'}
                placeholderTextColor={theme.placeholder}
                style={[
                  styles.locationSearch,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.inputBackground,
                  },
                ]}
              />
            ) : null}
            {statesLoading || citiesLoading ? (
              <Text style={[styles.locationStep, { color: theme.mutedText }]}>
                {citiesLoading ? 'Carregando cidades...' : 'Carregando estados...'}
              </Text>
            ) : null}
            <ScrollView style={styles.locationList} keyboardShouldPersistTaps="handled">
            {!statesLoading && !citiesLoading && locationPart === 'estado' ? states
              .filter((option) => {
                const search = locationSearch.trim().toLowerCase();
                return !search
                  || option.nome.toLowerCase().includes(search)
                  || option.sigla.toLowerCase().includes(search);
              })
              .map((option) => (
              <Pressable
                key={option.id}
                style={[styles.locationOption, { borderColor: theme.border }]}
                onPress={() => selectState(option)}
              >
                <Text style={[styles.value, { color: theme.text }]}>{option.sigla} - {option.nome}</Text>
              </Pressable>
            )) : null}
            {!statesLoading && !citiesLoading && locationPart === 'cidade' ? cities
              .filter((option) => {
                const search = locationSearch.trim().toLowerCase();
                return !search || option.nome.toLowerCase().includes(search);
              })
              .map((option) => (
              <Pressable
                key={option.id}
                style={[styles.locationOption, { borderColor: theme.border }]}
                onPress={() => {
                  setLocationDraft((current) => ({ ...current, cidade: option }));
                  setLocationPart('selected');
                  setLocationSearch('');
                }}
              >
                <Text style={[styles.value, { color: theme.text }]}>{option.nome}</Text>
              </Pressable>
            )) : null}
            </ScrollView>
            {locationPart === 'selected' ? (
              <Text style={[styles.value, { color: theme.text }]}>
                {locationDraft.cidade.nome}, {locationDraft.estado.sigla} - {locationDraft.estado.nome}, Brasil
              </Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setLocationModalVisible(false)} disabled={saving}>
                <Text style={[styles.cancelText, { color: theme.mutedText }]}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={saveLocation} disabled={saving || !locationDraft.cidade}>
                <Text style={[styles.saveText, { color: theme.primary }]}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
