import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  content: {
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 22,
    width: '100%',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 250,
    padding: 14,
    width: '100%',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    minHeight: 42,
  },
  status: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginTop: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
    minHeight: 54,
  },
  detail: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 7,
  },
  progressTrack: {
    borderRadius: 999,
    height: 7,
    marginTop: 9,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 999,
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  state: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  stateCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 28,
    padding: 20,
    width: '100%',
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 7,
  },
  stateText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});
