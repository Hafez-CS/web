import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useChatApi, type sendMessagedto } from "../services/chat/chat.service";

export function useAIHelperChat(id?: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { ChatHistory, New_room, SendMessage, Rooms } = useChatApi();

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: Rooms,
  });

  const chatQuery = useQuery({
    queryKey: ["ChatMessages", id],
    queryFn: () => ChatHistory(id || "test"),
    enabled: !!id,
  });

  const newRoomMutation = useMutation({
    mutationFn: New_room,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      navigate(`/helper/${data.slug}`);
      toast.success("چت جدید با موفقیت ساخته شد");
    },
    onError: (err: any) => toast.error(err.message || "خطا در ساخت چت جدید!"),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (payload: sendMessagedto) => SendMessage(payload),
    onSuccess: () => {
      toast.success("پیام با موفقیت ارسال شد");
      queryClient.invalidateQueries({ queryKey: ["ChatMessages", id] });
    },
    onError: () => toast.error("خطا در ارسال پیام!"),
  });

  return {
    roomsQuery,
    chatQuery,
    newRoomMutation,
    sendMessageMutation,
    ChatHistory,
    New_room,
    SendMessage,
    Rooms,
  };
}