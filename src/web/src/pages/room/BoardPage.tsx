import type { BoardState } from '@server/live-room/question-states';
import { QuestionState } from '@server/live-room/question-states';
import type { PublicStaticRoomData } from '@server/rooms';
import { QRCodeRender } from 'components/QRCode';
import { ResultsViewer } from 'components/ResultsViewer';
import { Heading, PageContainer, Question } from 'components/styles';
import { useState } from 'react';
import { routeBuilders } from 'routes';
import { twMerge } from 'tailwind-merge';
import { trpc } from 'utils/trpc';

export function BoardPage(props: { roomId: string; room: PublicStaticRoomData }) {
  return (
    <PageContainer className="gap-4">
      <div className="lg:hidden text-error">This page is not mobile friendly lol</div>
      <Heading className="text-accent">{props.room.name}</Heading>
      <div className="flex flex-row items-center gap-16">
        <div className="w-[512px]">
          <JoinPanel room={props.room} />
        </div>
        <div className="w-[512px] text-left">
          <StatusPanel room={props.room} />
        </div>
      </div>
    </PageContainer>
  );

  // if (!state) {
  //   return (
  //     <PageContainer>
  //       <Heading>Loading...</Heading>
  //     </PageContainer>
  //   );
  // }

  // if (state.state === QuestionState.Blank) {
  //   return (
  //     <PageContainer>
  //       <Heading>Waiting for a question...</Heading>
  //     </PageContainer>
  //   );
  // }

  // if (state.state === QuestionState.ShowingQuestion) {
  //   return (
  //     <div>
  //       <h1>Question: {state.question}</h1>
  //       <div>Candidates: {state.candidates.map((c) => c.name).join(', ')}</div>
  //       <div>Max Choices: {state.maxChoices}</div>
  //       <div>
  //         People voted: {state.peopleVoted}/{state.totalPeople}
  //       </div>
  //     </div>
  //   );
  // }

  // if (state.state === QuestionState.ShowingResults) {
  //   return (
  //     <div>
  //       <h1>Voting finished: {state.question}</h1>
  //       <div>
  //         Candidates:{' '}
  //         {state.candidates
  //           .sort((a, b) => a.votes - b.votes)
  //           .map((c) => `${c.name} (${c.votes})`)
  //           .join(', ')}
  //       </div>
  //       <div>Max Choices: {state.maxChoices}</div>
  //       <div>
  //         People voted: {state.peopleVoted}/{state.totalPeople}
  //       </div>
  //     </div>
  //   );
  // }

  return <h1>Room closed</h1>;
}

function JoinPanel(props: { room: PublicStaticRoomData; className?: string }) {
  const joinLink = location.origin + routeBuilders.shortJoin({ shortId: props.room.shortId });
  const boardLink = location.origin + routeBuilders.shortView({ shortId: props.room.shortId });
  return (
    <div className={twMerge('text-right flex flex-col items-end gap-4', props.className)}>
      <Heading>Join voting Room</Heading>
      <QRCodeRender content={joinLink} />
      {joinLink && (
        <p>
          <a target="_blank" rel="noreferrer" href={joinLink} className="text-3xl underline text-info font-mono">
            {joinLink}
          </a>
        </p>
      )}
      <div className="gap-2">
        <Heading className="text-2xl">View board</Heading>
        {joinLink && (
          <p>
            <a target="_blank" rel="noreferrer" href={boardLink} className="text-xl underline text-info font-mono">
              {boardLink}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPanel(props: { room: PublicStaticRoomData }) {
  const [state, setState] = useState<BoardState | null>(null);

  trpc.useSubscription(['room.listenBoardEvents', { roomId: props.room.id }], {
    onNext: (data) => {
      setState(data);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  if (!state) {
    return <Heading>Loading...</Heading>;
  }

  if (state.state === QuestionState.Blank) {
    return <Heading>Waiting for a question...</Heading>;
  }

  if (state.state === QuestionState.ShowingQuestion) {
    return (
      <div className="flex flex-col gap-4">
        <Question>{state.question}</Question>

        <div className="flex gap-8 flex-col items-start">
          <div className="flex flex-col gap-4">
            <div>
              <div>Votes remaining: {state.totalPeople - state.peopleVoted}</div>
              <progress className="progress progress-info w-48" max={state.totalPeople} value={state.peopleVoted} />
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-2 items-start flex-wrap max-h-[360px]">
              {state.candidates.map((candidate) => (
                <div className="alert min-w-[10rem] w-full" key={candidate.id}>
                  {candidate.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.state === QuestionState.ShowingResults) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Question>{state.question}</Question>
        <ResultsViewer results={state.results} />
      </div>
    );
  }

  const joinLink = location.origin + routeBuilders.shortJoin({ shortId: props.room.shortId });
  const boardLink = location.origin + routeBuilders.shortView({ shortId: props.room.shortId });
  return (
    <div className="text-right flex flex-col items-end gap-4 w-[512px]">
      <Heading>Join voting Room</Heading>
      <QRCodeRender content={joinLink} />
      {joinLink && (
        <p>
          <a target="_blank" rel="noreferrer" href={joinLink} className="text-3xl underline text-info font-mono">
            {joinLink}
          </a>
        </p>
      )}
      <div className="gap-2">
        <Heading className="text-2xl">View board</Heading>
        {joinLink && (
          <p>
            <a target="_blank" rel="noreferrer" href={boardLink} className="text-xl underline text-info font-mono">
              {boardLink}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
