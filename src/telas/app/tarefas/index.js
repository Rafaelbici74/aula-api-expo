import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, PanResponder, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
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
      {isResponsible ? (
        <Pressable onPress={() => onOpenMenu(task)} style={styles.menuButton} hitSlop={8}>
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
  }, [loadTasks]);

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

  useFocusEffect(useCallback(() => {
    loadTasks();
  }, [loadTasks]));

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.projectTitle, { color: theme.primaryDark }]} numberOfLines={1}>{tituloProjeto}</Text>
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
                      isResponsible={Number(task.responsavel_id) === Number(user?.id)}
                      onStartDrag={() => {}}
                      onFinishDrag={finishDrag}
                      onOpenMenu={setSelectedTask}
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
            <Text style={[styles.modalTitle, { color: theme.text }]}>Delegar tarefa</Text>
            {members.filter((member) => Number(member.usuario_id) !== Number(user?.id)).map((member) => (
              <Pressable
                key={String(member.usuario_id)}
                onPress={() => delegateTask(member)}
                style={[styles.memberButton, { borderColor: theme.border }]}
              >
                <Text style={{ color: theme.text }}>{member.nome}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setSelectedTask(null)} style={styles.closeButton}>
              <Text style={{ color: theme.primary }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
