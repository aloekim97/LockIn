import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Original styles
  status: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },

  // Notes styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  newButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newButtonText: {
    fontSize: 28,
    fontWeight: '300',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  noteItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteDate: {
    fontSize: 13,
  },
  notePreview: {
    fontSize: 13,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  editContainer: {
    flex: 1,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  doneButton: {
    fontSize: 17,
    fontWeight: '600',
  },
  deleteButton: {
    fontSize: 17,
    color: '#FF453A',
    fontWeight: '400',
  },
  editInput: {
    flex: 1,
    fontSize: 17,
    padding: 20,
    lineHeight: 24,
  },
});