import { StyleSheet } from 'react-native';

// Estilos da apresentação detalhada de um projeto e de seu status.
export default StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#7f8fe8',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbe3f0',
    shadowColor: '#172554',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#22c55e',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    color: '#374151',
    fontSize: 16,
    lineHeight: 24,
  },
  membersText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
  },
  detailsLoading: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listItem: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  memberName: {
    flex: 1,
  },
  memberRating: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  listSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  emptyText: {
    fontSize: 14,
  },
  progressText: {
    fontSize: 14,
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 999,
    height: '100%',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  linkButton: {
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingBottom: 8,
  },
  linkUrl: {
    fontSize: 12,
    marginTop: 3,
  },
  dateText: {
    marginTop: 20,
    color: '#6b7280',
    fontSize: 14,
  },
  joinButton: {
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 24,
    padding: 14,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  joinHint: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  applicationItem: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    padding: 12,
  },
  applicationMessage: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  applicationActions: {
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  entryPrompt: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  entryPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  entryPromptText: {
    fontSize: 13,
    marginTop: 5,
  },
  entryPromptActions: {
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  applicationModal: {
    borderRadius: 14,
    maxHeight: '85%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  vacancyOption: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  vacancyTitle: {
    fontWeight: '700',
  },
  vacancyDescription: {
    fontSize: 13,
    marginTop: 5,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 80,
    marginTop: 8,
    padding: 12,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 18,
  },
  cancelText: {
    fontWeight: '600',
  },
  saveText: {
    fontWeight: '700',
  },
});
