/*
 * Copyright 2025 Riccardo Perra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface EventsMap {
  [event: string]: any
}

interface DefaultEvents extends EventsMap {
  [event: string]: [...Array<any>]
}

export interface Unsubscribe {
  (): void
}

export interface Emitter<Events extends EventsMap = DefaultEvents> {
  events: Partial<{ [E in keyof Events]: Array<Events[E]> }>

  emit: <K extends keyof Events>(
    this: this,
    event: K,
    ...args: Parameters<Events[K]>
  ) => void

  on: <K extends keyof Events>(
    this: this,
    event: K,
    cb: Events[K],
  ) => Unsubscribe

  unsubscribe: () => void
}

export class EventEmitter<Events extends EventsMap> implements Emitter<Events> {
  events: Partial<{ [E in keyof Events]: Array<Events[E]> }> = {}

  constructor(
    private readonly abortController: AbortController = new AbortController(),
  ) {
    this.abortController.signal.addEventListener('abort', () => {
      this.unsubscribe()
    })
  }

  of<Events extends EventsMap>(): EventEmitter<Events> {
    return this as unknown as EventEmitter<Events>
  }

  on<K extends keyof Events>(this: this, event: K, cb: Events[K]): Unsubscribe {
    ;(this.events[event] ||= []).push(cb)
    return () => {
      this.events[event] = this.events[event]?.filter((i) => cb !== i)
    }
  }

  emit<K extends keyof Events>(
    this: this,
    event: K,
    ...args: Parameters<Events[K]>
  ): void {
    for (
      let i = 0,
        callbacks = this.events[event] || [],
        length = callbacks.length;
      i < length;
      i++
    ) {
      callbacks[i](...args)
    }
  }

  unsubscribe() {
    this.events = {}
  }
}

export function emitter<Events extends EventsMap = DefaultEvents>(
  abortController?: AbortController,
): EventEmitter<Events> {
  return new EventEmitter<Events>(abortController)
}
