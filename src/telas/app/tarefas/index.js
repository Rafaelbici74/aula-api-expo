import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';

import { useAuth } from '../../../context/AuthContext';
import { projetosApi } from '../../../services/projetosApi';
import { useTheme } from '../../../theme/ThemeContext';
import styles from './styles';

const columns = [
  { key: 'todo', title: 'A fazer' },
  { key: 'doing', title: 'Em andamento' },
  { key: 'review', title: 'Em revisão' },
  { key: 'done', title: 'Concluídas' },
];

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

function TaskCard({
  task,
  theme,
  isResponsible,
  canMove,
  canManage,
  onStartDrag,
  onFinishDrag,
  onOpenMenu,
  onClaim,
}) {
  const position = useRef(new Animated.Value(0)).current;
  const dragStarted = useRef(false);
  const dragTimer = useRef(null);
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => canMove,
    onPanResponderGrant: () => {
      dragStarted.current = false;
      dragTimer.current = setTimeout(() => {
        dragStarted.current = true;
        onStartDrag(task.id);
      }, 300);
    },
    onPanResponderMove: (_, gesture) => {
      if (dragStarted.current) position.setValue(gesture.dx);
    },
    onPanResponderRelease: (_, gesture) => {
      if (dragTimer.current) clearTimeout(dragTimer.current);
      if (dragStarted.current) onFinishDrag(task, gesture.dx);
      dragStarted.current = false;
      position.setValue(0);
    },
    onPanResponderTerminate: () => {
      if (dragTimer.current) clearTimeout(dragTimer.current);
      dragStarted.current = false;
      position.setValue(0);
    },
  })).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.taskCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        { transform: [{ translateX: position }] },
      ]}
    >
      {canManage || isResponsible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ações da tarefa"
          onPress={() => onOpenMenu(task)}
          style={styles.menuButton}
          hitSlop={8}
        >
          <Text style={[styles.menuText, { color: theme.primary }]}>:</Text>
        </Pressable>
      ) : null}
      <Text style={[styles.taskTitle, { color: theme.text }]}>{task.titulo}</Text>
      {task.descricao ? <Text style={[styles.taskDescription, { color: theme.mutedText }]}>{task.descricao}</Text> : null}
      <Text style={[styles.taskDetail, { color: theme.mutedText }]}>
        Responsável: {task.responsavel_nome || 'Não definido'}
      </Text>
      <Text style={[styles.taskDetail, { color: theme.mutedText }]}>
        Prioridade: {priorityLabels[task.prioridade] || task.prioridade || 'Não definida'}
      </Text>
      {task.data_vencimento ? (
        <Text style={[styles.taskDetail, { color: theme.mutedText }]}>
          Vencimento: {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
        </Text>
      ) : null}
      {!task.responsavel_id ? (
        <Pressable onPress={() => onClaim(task)} style={[styles.tasksButton, { borderColor: theme.primary }]}>
          <Text style={[styles.tasksButtonText, { color: theme.primary }]}>Pegar tarefa</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

export default function Tarefas() {
  const route = useRoute();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { height } = useWindowDimensions();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);
  const [isLeader, setIsLeader] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskActionMode, setTaskActionMode] = useState('actions');
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskFormError, setTaskFormError] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [actionTaskId, setActionTaskId] = useState(null);
  const projetoId = route.params?.projetoId;
  const tituloProjeto = route.params?.tituloProjeto || 'Projeto';

  const loadTasks = useCallback(async () => {
    if (!projetoId || !user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await projetosApi.listarTarefas(projetoId, user.id);
      setTasks(response.dados || []);
      setMembers(response.membros || []);
      setIsLeader(Boolean(response.usuario_e_lider));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [projetoId, user?.id]);

  const updateTask = useCallback(async (task, action) => {
    if (actionTaskId !== null) return;
    setActionTaskId(task.id);
    setError('');
    try {
      await action();
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionTaskId(null);
    }
  }, [actionTaskId, loadTasks]);

  const finishDrag = useCallback((task, distance) => {
    if (Math.abs(distance) < 50) return;
    const currentIndex = columns.findIndex((column) => column.key === task.status);
    const direction = distance < 0 ? 1 : -1;
    const steps = Math.max(1, Math.round(Math.abs(distance) / 220));
    const nextColumn = columns[currentIndex + (direction * steps)];
    if (!nextColumn || nextColumn.key === task.status) return;
    updateTask(task, () => projetosApi.moverTarefa(task.id, user.id, nextColumn.key));
  }, [updateTask, user?.id]);

  const claimTask = useCallback((task) => {
    updateTask(task, () => projetosApi.assumirTarefa(task.id, user.id));
  }, [updateTask, user?.id]);

  const delegateTask = useCallback((member) => {
    if (!selectedTask) return;
    setSelectedTask(null);
    updateTask(selectedTask, () => projetosApi.delegarTarefa(selectedTask.id, user.id, member.usuario_id));
  }, [selectedTask, updateTask, user?.id]);

  const openCreateTask = useCallback(() => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskPriority('medium');
    setTaskAssigneeId('');
    setTaskFormError('');
    setTaskModalVisible(true);
  }, []);

  const openEditTask = useCallback((task) => {
    setSelectedTask(null);
    setEditingTask(task);
    setTaskTitle(task.titulo || '');
    setTaskPriority(task.prioridade || 'medium');
    setTaskAssigneeId(task.responsavel_id ? String(task.responsavel_id) : '');
    setTaskFormError('');
    setTaskModalVisible(true);
  }, []);

  const saveTask = useCallback(async () => {
    const titulo = taskTitle.trim();
    if (!titulo || titulo.length > 255 || taskSubmitting) return;
    setTaskSubmitting(true);
    setTaskFormError('');
    try {
      const tarefa = {
        usuario_id: user.id,
        titulo,
        prioridade: taskPriority,
      };
      const response = editingTask
        ? await projetosApi.editarTarefa(editingTask.id, tarefa)
        : await projetosApi.criarTarefa(projetoId, {
          ...tarefa,
          responsavel_id: taskAssigneeId ? Number(taskAssigneeId) : null,
        });
      setTaskModalVisible(false);
      await loadTasks();
      Alert.alert(editingTask ? 'Tarefa atualizada' : 'Tarefa criada', response.message);
    } catch (requestError) {
      setTaskFormError(requestError.message);
    } finally {
      setTaskSubmitting(false);
    }
  }, [editingTask, loadTasks, projetoId, taskAssigneeId, taskPriority, taskSubmitting, taskTitle, user?.id]);

  const finishTask = useCallback((task) => {
    setSelectedTask(null);
    Alert.alert(
      'Finalizar tarefa?',
      `Deseja marcar "${task.titulo}" como concluída?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: () => updateTask(task, () => projetosApi.concluirTarefa(task.id, user.id)),
        },
      ],
    );
  }, [updateTask, user?.id]);

  const deleteTask = useCallback((task) => {
    setSelectedTask(null);
    Alert.alert(
      'Excluir tarefa?',
      `Deseja realmente excluir "${task.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => updateTask(task, () => projetosApi.excluirTarefa(task.id, user.id)),
        },
      ],
    );
  }, [updateTask, user?.id]);

  useFocusEffect(useCallback(() => {
    loadTasks();
  }, [loadTasks]));

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.projectTitle, { color: theme.primaryDark }]} numberOfLines={1}>{tituloProjeto}</Text>
        <Pressable
          accessibilityRole="button"
          disabled={taskSubmitting || actionTaskId !== null}
          onPress={openCreateTask}
          style={[styles.createButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.createButtonText}>Criar tarefa</Text>
        </Pressable>
      </View>
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.stateText, { color: theme.mutedText }]}>Carregando tarefas...</Text>
        </View>
      ) : error ? (
        <View style={[styles.stateCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.stateTitle, { color: theme.primaryDark }]}>Não foi possível carregar</Text>
          <Text style={[styles.stateText, { color: theme.mutedText }]}>{error}</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={[styles.stateCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.stateTitle, { color: theme.primaryDark }]}>Nenhuma tarefa cadastrada</Text>
          <Text style={[styles.stateText, { color: theme.mutedText }]}>Este projeto ainda não possui tarefas.</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          style={styles.boardScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.board}
        >
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.key);
            return (
              <View
                key={column.key}
                style={[
                  styles.column,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border, height: Math.max(300, height - 155) },
                ]}
              >
                <View style={styles.columnHeader}>
                  <Text style={[styles.columnTitle, { color: theme.text }]}>{column.title}</Text>
                  <Text style={[styles.columnCount, { color: theme.mutedText }]}>{columnTasks.length}</Text>
                </View>
                <ScrollView nestedScrollEnabled style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                  {columnTasks.length === 0 ? (
                    <Text style={[styles.emptyColumn, { color: theme.mutedText }]}>Nenhuma tarefa</Text>
                  ) : columnTasks.map((task) => (
                    <TaskCard
                      key={String(task.id)}
                      task={task}
                      theme={theme}
                      canMove={isLeader || Number(task.responsavel_id) === Number(user?.id)}
                      canManage={isLeader || Number(task.responsavel_id) === Number(user?.id)}
                      isResponsible={Number(task.responsavel_id) === Number(user?.id)}
                      onStartDrag={() => {}}
                      onFinishDrag={finishDrag}
                      onOpenMenu={(taskToManage) => {
                        setTaskActionMode('actions');
                        setSelectedTask(taskToManage);
                      }}
                      onClaim={claimTask}
                    />
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
      )}
      {actionTaskId ? <View style={styles.actionLoading}><ActivityIndicator color={theme.primary} /></View> : null}
      <Modal visible={Boolean(selectedTask)} transparent animationType="fade" onRequestClose={() => setSelectedTask(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {taskActionMode === 'actions' ? 'Ações da tarefa' : 'Delegar tarefa'}
            </Text>
            {taskActionMode === 'actions' && selectedTask ? (
              <>
                <Pressable
                  onPress={() => openEditTask(selectedTask)}
                  style={[styles.memberButton, { borderColor: theme.border }]}
                >
                  <Text style={{ color: theme.text }}>Editar título e prioridade</Text>
                </Pressable>
                {Number(selectedTask.responsavel_id) === Number(user?.id) ? (
                  <Pressable
                    onPress={() => setTaskActionMode('delegate')}
                    style={[styles.memberButton, { borderColor: theme.border }]}
                  >
                    <Text style={{ color: theme.text }}>Delegar tarefa</Text>
                  </Pressable>
                ) : null}
                {selectedTask.status !== 'done' ? (
                  <Pressable
                    onPress={() => finishTask(selectedTask)}
                    style={[styles.memberButton, { borderColor: theme.border }]}
                  >
                    <Text style={{ color: theme.text }}>Finalizar tarefa</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => deleteTask(selectedTask)}
                  style={[styles.memberButton, { borderColor: theme.error }]}
                >
                  <Text style={{ color: theme.error }}>Excluir tarefa</Text>
                </Pressable>
              </>
            ) : taskActionMode === 'delegate' && selectedTask ? (
              members.filter((member) => Number(member.usuario_id) !== Number(user?.id)).length ? (
                members.filter((member) => Number(member.usuario_id) !== Number(user?.id)).map((member) => (
                  <Pressable
                    key={String(member.usuario_id)}
                    onPress={() => delegateTask(member)}
                    style={[styles.memberButton, { borderColor: theme.border }]}
                  >
                    <Text style={{ color: theme.text }}>{member.nome}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={[styles.stateText, { color: theme.mutedText }]}>Nenhum outro membro ativo disponível.</Text>
              )
            ) : null}
            <Pressable
              onPress={() => {
                if (taskActionMode === 'delegate') setTaskActionMode('actions');
                else setSelectedTask(null);
              }}
              style={styles.closeButton}
            >
              <Text style={{ color: theme.primary }}>{taskActionMode === 'delegate' ? 'Voltar' : 'Cancelar'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={taskModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, styles.formModalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingTask ? 'Editar tarefa' : 'Criar tarefa'}
            </Text>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.formScroll}
            >
              <Text style={[styles.formLabel, { color: theme.text }]}>Nome</Text>
              <TextInput
                maxLength={255}
                placeholder="Nome da tarefa"
                placeholderTextColor={theme.placeholder}
                value={taskTitle}
                onChangeText={setTaskTitle}
                style={[
                  styles.formInput,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text },
                ]}
              />
              {taskFormError ? (
                <Text style={[styles.formError, { color: theme.error }]}>{taskFormError}</Text>
              ) : null}
              <Text style={[styles.formLabel, { color: theme.text }]}>Prioridade</Text>
              <View style={styles.optionRow}>
                {Object.entries(priorityLabels).map(([priority, label]) => (
                  <Pressable
                    key={priority}
                    onPress={() => setTaskPriority(priority)}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: taskPriority === priority ? theme.primary : theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={{ color: taskPriority === priority ? '#fff' : theme.text }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
              {!editingTask ? (
                <>
                  <Text style={[styles.formLabel, { color: theme.text }]}>Responsável</Text>
                  <Pressable
                    onPress={() => setTaskAssigneeId('')}
                    style={[
                      styles.memberButton,
                      {
                        backgroundColor: taskAssigneeId ? theme.surface : theme.inputBackground,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={{ color: theme.text }}>Sem responsável</Text>
                  </Pressable>
                  {members.map((member) => {
                    const memberId = String(member.usuario_id);
                    const selected = taskAssigneeId === memberId;
                    return (
                      <Pressable
                        key={memberId}
                        onPress={() => setTaskAssigneeId(memberId)}
                        style={[
                          styles.memberButton,
                          {
                            backgroundColor: selected ? theme.inputBackground : theme.surface,
                            borderColor: selected ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text style={{ color: theme.text }}>{member.nome}</Text>
                      </Pressable>
                    );
                  })}
                </>
              ) : null}
            </ScrollView>
            <View style={styles.formActions}>
              <Pressable
                disabled={taskSubmitting}
                onPress={() => setTaskModalVisible(false)}
                style={[styles.formActionButton, { borderColor: theme.border }]}
              >
                <Text style={{ color: theme.text }}>Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={taskSubmitting || !taskTitle.trim()}
                onPress={saveTask}
                style={[
                  styles.formActionButton,
                  { backgroundColor: theme.primary, borderColor: theme.primary },
                  (taskSubmitting || !taskTitle.trim()) && styles.disabledButton,
                ]}
              >
                {taskSubmitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.createButtonText}>{editingTask ? 'Salvar' : 'Criar'}</Text>}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
