import { StyleSheet } from 'react-native';
import { colors } from '../../../stylesGlobal';

// Estilos da listagem de projetos, estados vazios e feedback de carregamento.
export default StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  titulo: {
    flex: 1,
    fontSize: 19,
    fontWeight: '700',
    color: colors.primaryDark,
    marginRight: 8,
  },
  headerInput: {
    width: '100%',
    height: 52,
    marginTop: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 0,
    fontSize: 15,
    color: colors.text,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  filterButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  filterButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  filterModal: {
    borderRadius: 14,
    padding: 20,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  filterOption: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  filterOptionText: {
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 12,
  },
  filterCancel: {
    fontWeight: '600',
  },
  filterApply: {
    fontWeight: '700',
  },
  projetosSection: {
    width: '100%',
    maxWidth: 360,
  },
  projetosContainer: {
    width: '100%',
    gap: 12,
    marginTop: 12,
  },
  projetoCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  projetoTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  projetoDescricao: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  projetoMembros: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  projetoCandidaturasIndisponiveis: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  projetoStatusContainer: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  projetoStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onStatus,
  },
  projetoStatusAberto: {
    backgroundColor: colors.statusOpen,
  },
  projetoStatusEmAndamento: {
    backgroundColor: colors.statusInProgress,
  },
  projetoStatusFinalizado: {
    backgroundColor: colors.statusDone,
  },
  loadingContainer: {
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  loadingText: {
    marginTop: 12,
    color: colors.mutedText,
    fontSize: 14,
  },
  emptyState: {
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 14,
    textAlign: 'center',
  },
});
