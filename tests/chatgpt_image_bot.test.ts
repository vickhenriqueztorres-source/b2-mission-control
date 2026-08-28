import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { ChatGptImageBotAdapter } from '../adapters/chatgptImageBotAdapter';
import { ChatGptToStartFrameBridge } from '../production-bridge/chatgptToStartFrame';

test('ChatGPT Image Bot Adapter - Inicialização e Health Check', async () => {
  const adapter = new ChatGptImageBotAdapter();
  await adapter.initialize();
  const healthy = await adapter.checkHealth();
  assert.equal(healthy, true, 'O adaptador do ChatGPT Image Bot deve estar saudável.');
  assert.equal(adapter.getName(), 'ChatGptImageBotAdapter');
});

test('ChatGPT Image Bot - Leitura de Manifesto', async () => {
  const adapter = new ChatGptImageBotAdapter();
  const manifest = adapter.getManifestEntries();
  assert.ok(Array.isArray(manifest), 'Manifesto deve retornar uma lista.');
});

test('ChatGPT Start Frame Bridge - Estrutura e Interface', async () => {
  const bridge = new ChatGptToStartFrameBridge();
  assert.ok(bridge, 'A ponte ChatGptToStartFrameBridge deve ser instanciada com sucesso.');
});
