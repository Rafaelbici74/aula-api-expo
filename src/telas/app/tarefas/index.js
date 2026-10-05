import { useCallback, useEffect, useRef, useState } from 'react';
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

const TASK_DRAG_HOLD_DURATION = 2500;
const TASK_COLUMN_STEP = 272;

function TaskCard({
  task,
  theme,
  isResponsible,
  canMove,
  canManage,
  onStartDrag,
  onHoldReady,
  onDragMove,
  onFinishDrag,
  onCancelDrag,
  onOpenMenu,
  onClaim,
  isHidden = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const holdProgress = useRef(new Animated.Value(0)).current;
  const dragStarted = useRef(false);
  const touchActive = useRef(false);
  const holdReady = useRef(false);
  const touchOrigin = useRef(null);
  const cardRef = useRef(null);
  const taskRef = useRef(task);
  const canMoveRef = useRef(canMove);
  const onStartDragRef = useRef(onStartDrag);
  const onHoldReadyRef = useRef(onHoldReady);
  const onDragMoveRef = useRef(onDragMove);
  const onFinishDragRef = useRef(onFinishDrag);
  const onCancelDragRef = useRef(onCancelDrag);
  const [holding, setHolding] = useState(false);
  taskRef.current = task;
  canMoveRef.current = canMove;
  onStartDragRef.current = onStartDrag;
  onHoldReadyRef.current = onHoldReady;
  onDragMoveRef.current = onDragMove;
  onFinishDragRef.current = onFinishDrag;
  onCancelDragRef.current = onCancelDrag;

  useEffect(() => () => {
    touchActive.current = false;
    holdProgress.stopAnimation();
    scale.stopAnimation();
  }, [holdProgress, scale]);

  function resetHold() {
    const wasReady = holdReady.current;
    touchActive.current = false;
    holdReady.current = false;
    touchOrigin.current = null;
    holdProgress.stopAnimation();
    holdProgress.setValue(0);
    scale.stopAnimation();
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    setHolding(false);
    if (wasReady) onHoldReadyRef.current(null);
  }

  function beginHold(event) {
    if (!canMoveRef.current) return;
    resetHold();
    touchActive.current = true;
    touchOrigin.current = {
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    };
    setHolding(true);
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: TASK_DRAG_HOLD_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished || !touchActive.current) return;
      holdReady.current = true;
      onHoldReadyRef.current(taskRef.current.id);
      Animated.spring(scale, {
        toValue: 1.035,
        useNativeDriver: true,
      }).start();
    });
  }

  function cancelHoldOnMovement(event) {
    if (!touchActive.current || holdReady.current || !touchOrigin.current) return;
    const dx = event.nativeEvent.pageX - touchOrigin.current.x;
    const dy = event.nativeEvent.pageY - touchOrigin.current.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    resetHold();
  }

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponderCapture: (_, gesture) => (
      canMoveRef.current
      && holdReady.current
      && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4)
    ),
    onPanResponderGrant: (_, gesture) => {
      dragStarted.current = true;
      cardRef.current?.measureInWindow((x, y, width, height) => {
        onStartDragRef.current(
          taskRef.current,
          { x, y, width, height },
          { x: gesture.moveX, y: gesture.moveY },
        );
      });
    },
    onPanResponderMove: (_, gesture) => {
      if (!dragStarted.current) return;
      onDragMoveRef.current(gesture.moveX, gesture.moveY);
    },
    onPanResponderRelease: (_, gesture) => {
      if (dragStarted.current) {
        onFinishDragRef.current(taskRef.current, gesture.dx);
      } else {
        onCancelDragRef.current();
      }
      dragStarted.current = false;
      resetHold();
    },
    onPanResponderTerminate: () => {
      dragStarted.current = false;
      onCancelDragRef.current();
      resetHold();
    },
    onPanResponderTerminationRequest: () => false,
  })).current;

  return (
    <Animated.View
      ref={cardRef}
      {...panResponder.panHandlers}
      onTouchStart={beginHold}
      onTouchMove={cancelHoldOnMovement}
      onTouchEnd={() => {
        if (!dragStarted.current) resetHold();
      }}
      onTouchCancel={() => {
        if (!dragStarted.current) resetHold();
      }}
      style={[
        styles.taskCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        isHidden && styles.hiddenTaskCard,
        { transform: [{ scale }] },
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
      {holding ? (
        <View pointerEvents="none" style={styles.holdFeedback}>
          <View style={[styles.holdTrack, { backgroundColor: theme.border }]}>
            <Animated.View
              style={[
                styles.holdProgress,
                {
                  backgroundColor: theme.primary,
                  width: holdProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
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
  const [dragArmedTaskId, setDragArmedTaskId] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const boardScrollRef = useRef(null);
  const screenRef = useRef(null);
  const screenOrigin = useRef({ x: 0, y: 0 });
  const dragOverlayX = useRef(new Animated.Value(0)).current;
  const dragOverlayY = useRef(new Animated.Value(0)).current;
  const dragGrabOffset = useRef({ x: 0, y: 0 });
  const boardViewport = useRef({ x: 0, width: 0 });
  const boardContentWidth = useRef(0);
  const boardScrollX = useRef(0);
  const dragStartScrollX = useRef(0);
  const autoScrollDirection = useRef(0);
  const autoScrollInterval = useRef(null);
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

  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    autoScrollInterval.current = null;
    autoScrollDirection.current = 0;
  }, []);

  useEffect(() => () => stopAutoScroll(), [stopAutoScroll]);

  const clearDragOverlay = useCallback(() => {
    setDraggedTask(null);
    stopAutoScroll();
  }, [stopAutoScroll]);

  const startTaskDrag = useCallback((task, bounds, pointer) => {
    dragStartScrollX.current = boardScrollX.current;
    dragGrabOffset.current = {
      x: pointer.x - bounds.x,
      y: pointer.y - bounds.y,
    };
    dragOverlayX.setValue(bounds.x - screenOrigin.current.x);
    dragOverlayY.setValue(bounds.y - screenOrigin.current.y);
    setDraggedTask({
      ...task,
      overlayCanManage: isLeader || Number(task.responsavel_id) === Number(user?.id),
      overlayIsResponsible: Number(task.responsavel_id) === Number(user?.id),
      overlayWidth: bounds.width,
      overlayHeight: bounds.height,
    });
    stopAutoScroll();
  }, [dragOverlayX, dragOverlayY, isLeader, stopAutoScroll, user?.id]);

  const updateAutoScroll = useCallback((pointerX, pointerY) => {
    if (!draggedTask) return;
    dragOverlayX.setValue(pointerX - screenOrigin.current.x - dragGrabOffset.current.x);
    dragOverlayY.setValue(pointerY - screenOrigin.current.y - dragGrabOffset.current.y);
    const { x, width } = boardViewport.current;
    const edgeSize = 48;
    const direction = pointerX < x + edgeSize
      ? -1
      : pointerX > x + width - edgeSize
        ? 1
        : 0;

    if (direction === autoScrollDirection.current) return;
    stopAutoScroll();
    if (!direction) return;

    autoScrollDirection.current = direction;
    autoScrollInterval.current = setInterval(() => {
      const maxOffset = Math.max(0, boardContentWidth.current - boardViewport.current.width);
      const nextOffset = Math.max(
        0,
        Math.min(maxOffset, boardScrollX.current + autoScrollDirection.current * 16),
      );
      if (nextOffset === boardScrollX.current) {
        stopAutoScroll();
        return;
      }
      boardScrollX.current = nextOffset;
      boardScrollRef.current?.scrollTo({ x: nextOffset, animated: false });
    }, 30);
  }, [draggedTask, dragOverlayX, dragOverlayY, stopAutoScroll]);

  const finishDrag = useCallback((task, distance) => {
    stopAutoScroll();
    setDraggedTask(null);
    const currentIndex = columns.findIndex((column) => column.key === task.status);
    const scrollDistance = boardScrollX.current - dragStartScrollX.current;
    const columnOffset = Math.round((distance + scrollDistance) / TASK_COLUMN_STEP);
    const nextIndex = Math.max(0, Math.min(columns.length - 1, currentIndex + columnOffset));
    const nextColumn = columns[nextIndex];
    if (!nextColumn || nextColumn.key === task.status) return;
    updateTask(task, () => projetosApi.moverTarefa(task.id, user.id, nextColumn.key));
  }, [stopAutoScroll, updateTask, user?.id]);

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
    <View
      ref={screenRef}
      onLayout={() => {
        screenRef.current?.measureInWindow((x, y) => {
          screenOrigin.current = { x, y };
        });
      }}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
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
          ref={boardScrollRef}
          horizontal
          style={styles.boardScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.board}
          onScroll={(event) => { boardScrollX.current = event.nativeEvent.contentOffset.x; }}
          onContentSizeChange={(width) => { boardContentWidth.current = width; }}
          onLayout={(event) => {
            boardViewport.current.width = event.nativeEvent.layout.width;
            boardScrollRef.current?.measureInWindow((x) => {
              boardViewport.current.x = x;
            });
          }}
          scrollEnabled={!dragArmedTaskId}
          scrollEventThrottle={16}
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
                <ScrollView
                  nestedScrollEnabled
                  scrollEnabled={!dragArmedTaskId}
                  style={styles.columnScroll}
                  showsVerticalScrollIndicator={false}
                >
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
                      onStartDrag={startTaskDrag}
                      onHoldReady={setDragArmedTaskId}
                      onDragMove={updateAutoScroll}
                      onFinishDrag={finishDrag}
                      onCancelDrag={clearDragOverlay}
                      onOpenMenu={(taskToManage) => {
                        setTaskActionMode('actions');
                        setSelectedTask(taskToManage);
                      }}
                      onClaim={claimTask}
                      isHidden={draggedTask?.id === task.id}
                    />
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
      )}
      {actionTaskId ? <View style={styles.actionLoading}><ActivityIndicator color={theme.primary} /></View> : null}
      {draggedTask ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.taskCard,
            styles.dragOverlay,
            {
              backgroundColor: theme.surface,
              borderColor: theme.primary,
              height: draggedTask.overlayHeight,
              width: draggedTask.overlayWidth,
              transform: [{ translateX: dragOverlayX }, { translateY: dragOverlayY }, { scale: 1.035 }],
            },
          ]}
        >
          {draggedTask.overlayCanManage || draggedTask.overlayIsResponsible ? (
            <View style={styles.menuButton}>
              <Text style={[styles.menuText, { color: theme.primary }]}>:</Text>
            </View>
          ) : null}
          <Text style={[styles.taskTitle, { color: theme.text }]}>{draggedTask.titulo}</Text>
          {draggedTask.descricao ? (
            <Text style={[styles.taskDescription, { color: theme.mutedText }]}>{draggedTask.descricao}</Text>
          ) : null}
          <Text style={[styles.taskDetail, { color: theme.mutedText }]}>
            Responsável: {draggedTask.responsavel_nome || 'Não definido'}
          </Text>
          <Text style={[styles.taskDetail, { color: theme.mutedText }]}>
            Prioridade: {priorityLabels[draggedTask.prioridade] || draggedTask.prioridade || 'Não definida'}
          </Text>
          {draggedTask.data_vencimento ? (
            <Text style={[styles.taskDetail, { color: theme.mutedText }]}>
              Vencimento: {new Date(draggedTask.data_vencimento).toLocaleDateString('pt-BR')}
            </Text>
          ) : null}
          {!draggedTask.responsavel_id ? (
            <View style={[styles.tasksButton, { borderColor: theme.primary }]}>
              <Text style={[styles.tasksButtonText, { color: theme.primary }]}>Pegar tarefa</Text>
            </View>
          ) : null}
        </Animated.View>
      ) : null}
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
