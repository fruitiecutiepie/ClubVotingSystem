import { Location } from '@prisma/client';
import * as trpc from '@trpc/server';
import { z } from 'zod';

import type { BoardState } from '../live-room/question-states';
import type { PublicStaticRoomData } from '../rooms';
import { createLiveRoom, getLiveRoomOrError, getRoomById, getRoomByShortId } from '../rooms';

export const roomRouter = trpc
  .router()
  .mutation('create', {
    input: z.object({
      name: z.string().refine((s) => s.length > 0, { message: 'Name must not be empty' }),
    }),
    async resolve({ input }) {
      const room = await createLiveRoom(input.name);
      const publicData: PublicStaticRoomData = {
        id: room.id,
        shortId: room.shortId,
        name: room.name,
        createdAt: room.createdAt.toISOString(),
      };
      return {
        ...publicData,
        adminKey: room.adminKey,
      };
    },
  })
  .query('getRoomByShortId', {
    input: z.object({
      shortId: z.string(),
    }),
    async resolve({ input }) {
      const room = await getRoomByShortId(input.shortId);
      return room;
    },
  })
  .query('getRoomById', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const room = await getRoomById(input.id);
      return room;
    },
  })
  .mutation('joinWaitingList', {
    input: z.object({
      roomId: z.string(),
      studentEmail: z.string().refine((s) => s.length > 0, { message: 'Email must not be empty' }),
      location: z.nativeEnum(Location),
    }),
    async resolve({ input }) {
      const room = await getLiveRoomOrError(input.roomId);

      const user = await room.joinWaitingRoom({
        studentEmail: input.studentEmail,
        location: input.location,
      });
      return user;
    },
  })
  .subscription('listenBoardEvents', {
    input: z.object({
      roomId: z.string(),
    }),
    async resolve({ input }) {
      const room = await getLiveRoomOrError(input.roomId);
      return new trpc.Subscription<BoardState>(async (emit) => {
        const unsubscribe = await room.listenBoard((state) => {
          emit.data(state);
        });
        return unsubscribe;
      });
    },
  });