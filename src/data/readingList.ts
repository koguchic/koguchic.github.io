export interface Paper {
  id: string;
  t: string;      // title
  s?: string;     // short name
  meta: string;   // authors · year · venue
  url: string;
  why: string;
  type: string;
  core: boolean;
}

export interface Track {
  n: string;
  title: string;
  sub: string;
  papers: Paper[];
}

export const TRACKS: Track[] = [
  {
    n: '00',
    title: 'Orientation & Toolchain',
    sub: "The textbook, the benchmark, and the two libraries you'll actually run.",
    papers: [
      { id: 'sutton-barto', t: 'Reinforcement Learning: An Introduction (2nd ed.)', s: 'Sutton & Barto', meta: 'Sutton & Barto · 2018 · textbook', url: 'http://incompleteideas.net/book/the-book.html', why: "The canonical grounding. You don't need all of it — Ch. 3–6 (MDPs, TD learning) and Ch. 13 (policy gradients) are the load-bearing chapters for everything below.", type: 'textbook', core: true },
      { id: 'spinningup', t: 'Spinning Up in Deep RL', s: 'OpenAI', meta: 'OpenAI · tutorial + code', url: 'https://spinningup.openai.com', why: 'The fastest bridge from theory to working code. Read the algorithm intros alongside the papers in Tracks 1–2.', type: 'tutorial', core: true },
      { id: 'gymnasium', t: 'Gymnasium Documentation', s: 'Farama', meta: 'Farama Foundation · docs', url: 'https://gymnasium.farama.org', why: 'The maintained Gym. Covers the Atari (ale-py) env, wrappers, and vectorized envs you’ll use to get throughput on your 10 cores.', type: 'docs', core: true },
      { id: 'ale', t: 'The Arcade Learning Environment: An Evaluation Platform for General Agents', s: 'ALE', meta: 'Bellemare et al. · 2013 · JAIR', url: 'https://arxiv.org/abs/1207.4708', why: 'Why Atari became THE benchmark. Read for the framing of general competency across many games from pixels.', type: 'benchmark', core: true },
      { id: 'ale-revisit', t: 'Revisiting the Arcade Learning Environment', meta: 'Machado et al. · 2018', url: 'https://arxiv.org/abs/1709.06009', why: 'Defines the evaluation protocol everyone now cites — sticky actions, no-op starts, the 26-game subset. Read before you trust any score comparison.', type: 'protocol', core: true },
      { id: 'sb3', t: 'Stable-Baselines3: Reliable Reinforcement Learning Implementations', s: 'SB3', meta: 'Raffin et al. · 2021 · JMLR', url: 'https://jmlr.org/papers/v22/20-1364.html', why: 'Your known-good baseline library. The paper explains the design; the Zoo repo gives tuned Atari hyperparameters.', type: 'library', core: true },
      { id: 'cleanrl', t: 'CleanRL: High-quality Single-file Implementations of Deep RL Algorithms', s: 'CleanRL', meta: 'Huang et al. · 2022', url: 'https://arxiv.org/abs/2111.08819', why: 'The read-and-modify library. Single-file PPO/DQN you can study line by line — ideal since your goal is to understand and rewrite algorithms.', type: 'library', core: true },
      { id: 'rliable', t: 'Deep Reinforcement Learning at the Edge of the Statistical Precipice', s: 'rliable', meta: 'Agarwal et al. · 2021 · NeurIPS', url: 'https://arxiv.org/abs/2108.13264', why: 'How to report Atari-100k honestly: IQM, stratified bootstrap CIs, performance profiles. Adopt this before you claim anything beats anything.', type: 'methodology', core: true },
    ],
  },
  {
    n: '01',
    title: 'Value-Based Deep RL',
    sub: 'The DQN family — the lineage that put deep learning on Atari.',
    papers: [
      { id: 'dqn', t: 'Playing Atari with Deep Reinforcement Learning', s: 'DQN', meta: 'Mnih et al. · 2013 (+ Nature 2015)', url: 'https://arxiv.org/abs/1312.5602', why: 'The origin. Replay buffer + target network + CNN on pixels. The Nature 2015 version is the full human-level-control paper.', type: 'foundational', core: true },
      { id: 'ddqn', t: 'Deep Reinforcement Learning with Double Q-learning', s: 'Double DQN', meta: 'van Hasselt et al. · 2015', url: 'https://arxiv.org/abs/1509.06461', why: "Fixes DQN's systematic value overestimation with a one-line change. First of the Rainbow components.", type: 'improvement', core: true },
      { id: 'dueling', t: 'Dueling Network Architectures for Deep Reinforcement Learning', s: 'Dueling DQN', meta: 'Wang et al. · 2016', url: 'https://arxiv.org/abs/1511.06581', why: 'Splits value and advantage streams. A clean architectural idea worth internalizing.', type: 'improvement', core: true },
      { id: 'per', t: 'Prioritized Experience Replay', s: 'PER', meta: 'Schaul et al. · 2015', url: 'https://arxiv.org/abs/1511.05952', why: 'Sample transitions by TD-error magnitude. Central to sample-efficiency and directly relevant to Track 6.', type: 'improvement', core: true },
      { id: 'c51', t: 'A Distributional Perspective on Reinforcement Learning', s: 'C51', meta: 'Bellemare et al. · 2017', url: 'https://arxiv.org/abs/1707.06887', why: 'Predict the full return distribution, not just its mean. A conceptual shift that reappears everywhere later.', type: 'foundational', core: true },
      { id: 'iqn', t: 'Implicit Quantile Networks for Distributional RL', s: 'IQN', meta: 'Dabney et al. · 2018', url: 'https://arxiv.org/abs/1806.06923', why: 'The stronger distributional estimator, and a strong classic-Atari baseline in its own right.', type: 'improvement', core: false },
      { id: 'rainbow', t: 'Rainbow: Combining Improvements in Deep Reinforcement Learning', s: 'Rainbow', meta: 'Hessel et al. · 2018', url: 'https://arxiv.org/abs/1710.02298', why: 'Combines the six improvements above into one agent and ablates each. The reference synthesis of value-based Atari RL.', type: 'synthesis', core: true },
    ],
  },
  {
    n: '02',
    title: 'Policy Gradients & Actor-Critic',
    sub: 'The other half of model-free RL — what PPO in your libraries actually is.',
    papers: [
      { id: 'a3c', t: 'Asynchronous Methods for Deep Reinforcement Learning', s: 'A3C', meta: 'Mnih et al. · 2016', url: 'https://arxiv.org/abs/1602.01783', why: 'Parallel actors + advantage actor-critic. Introduces the throughput-from-many-envs idea you’ll lean on locally.', type: 'foundational', core: true },
      { id: 'gae', t: 'High-Dimensional Continuous Control Using Generalized Advantage Estimation', s: 'GAE', meta: 'Schulman et al. · 2015', url: 'https://arxiv.org/abs/1506.02438', why: 'The bias/variance advantage estimator that PPO uses under the hood. Short and essential.', type: 'foundational', core: true },
      { id: 'trpo', t: 'Trust Region Policy Optimization', s: 'TRPO', meta: 'Schulman et al. · 2015', url: 'https://arxiv.org/abs/1502.05477', why: 'The theory PPO approximates. Read for the constrained-update intuition; skim the math.', type: 'theory', core: false },
      { id: 'ppo', t: 'Proximal Policy Optimization Algorithms', s: 'PPO', meta: 'Schulman et al. · 2017', url: 'https://arxiv.org/abs/1707.06347', why: 'The default on-policy workhorse and the most-run algorithm in your libraries. Pair with CleanRL’s ppo_atari.py.', type: 'foundational', core: true },
      { id: 'sac', t: 'Soft Actor-Critic: Off-Policy Maximum Entropy Deep RL', s: 'SAC', meta: 'Haarnoja et al. · 2018', url: 'https://arxiv.org/abs/1801.01290', why: 'The entropy-regularized off-policy standard. Continuous-control default and useful background for world-model actor losses.', type: 'foundational', core: true },
    ],
  },
  {
    n: '03',
    title: 'Model-Based RL & Planning',
    sub: 'Learn a model, then plan or imagine inside it — the MuZero line.',
    papers: [
      { id: 'world-models', t: 'World Models', s: 'Ha & Schmidhuber', meta: 'Ha & Schmidhuber · 2018', url: 'https://arxiv.org/abs/1803.10122', why: 'The paper that named the field. VAE + RNN dream, train the controller inside it. The conceptual seed of everything in Tracks 4–5.', type: 'foundational', core: true },
      { id: 'simple', t: 'Model-Based Reinforcement Learning for Atari', s: 'SimPLe', meta: 'Kaiser et al. · 2019', url: 'https://arxiv.org/abs/1903.00374', why: 'First serious model-based attempt on Atari, and the paper that introduced the 100k-step sample-efficiency regime.', type: 'foundational', core: true },
      { id: 'muzero', t: 'Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model', s: 'MuZero', meta: 'Schrittwieser et al. · 2020 · Nature', url: 'https://arxiv.org/abs/1911.08265', why: 'Plan with a learned latent model — no rules given. The backbone of the strongest sample-efficient agents.', type: 'landmark', core: true },
      { id: 'efficientzero', t: 'Mastering Atari Games with Limited Data', s: 'EfficientZero', meta: 'Ye et al. · 2021 · NeurIPS', url: 'https://arxiv.org/abs/2111.00210', why: 'First agent to beat human median on Atari-100k. The MuZero-lineage benchmark to compare against.', type: 'landmark', core: true },
      { id: 'mbrl-survey', t: 'Model-based Reinforcement Learning: A Survey', meta: 'Moerland et al. · 2020', url: 'https://arxiv.org/abs/2006.16712', why: 'Map of the territory — the taxonomy that situates Dreamer, MuZero, and world models relative to each other.', type: 'survey', core: false },
    ],
  },
  {
    n: '04',
    title: 'The Dreamer Line',
    sub: 'Recurrent latent world models — the reconstruction-based mainline.',
    papers: [
      { id: 'planet', t: 'Learning Latent Dynamics for Planning from Pixels', s: 'PlaNet', meta: 'Hafner et al. · 2019', url: 'https://arxiv.org/abs/1811.04551', why: 'Introduces the RSSM — the recurrent state-space model that the whole Dreamer series is built on.', type: 'foundational', core: true },
      { id: 'dreamer', t: 'Dream to Control: Learning Behaviors by Latent Imagination', s: 'Dreamer', meta: 'Hafner et al. · 2020', url: 'https://arxiv.org/abs/1912.01603', why: 'Learn behaviors purely by rolling out imagined latent trajectories. The core actor-critic-in-a-dream recipe.', type: 'foundational', core: true },
      { id: 'dreamerv2', t: 'Mastering Atari with Discrete World Models', s: 'DreamerV2', meta: 'Hafner et al. · 2021', url: 'https://arxiv.org/abs/2010.02193', why: 'Discrete latents; first world model to reach human-level on the full 200M-frame Atari benchmark.', type: 'landmark', core: true },
      { id: 'dreamerv3', t: 'Mastering Diverse Domains through World Models', s: 'DreamerV3', meta: 'Hafner et al. · 2023', url: 'https://arxiv.org/abs/2301.04104', why: 'The one to know cold. One hyperparameter set across Atari, control, and Minecraft — and the clearest evidence that world models improve monotonically with scale.', type: 'landmark', core: true },
      { id: 'tdmpc2', t: 'TD-MPC2: Scalable, Robust World Models for Continuous Control', s: 'TD-MPC2', meta: 'Hansen et al. · 2024', url: 'https://arxiv.org/abs/2310.16828', why: "A non-reconstructive, planning-in-latent alternative to Dreamer. A useful contrast point and a bridge toward Track 7's philosophy.", type: 'alternative', core: false },
    ],
  },
  {
    n: '05',
    title: 'Transformer & Diffusion World Models',
    sub: 'Replace the RNN with a sequence model — or generate frames directly.',
    papers: [
      { id: 'iris', t: 'Transformers are Sample-Efficient World Models', s: 'IRIS', meta: 'Micheli et al. · 2023 · ICLR', url: 'https://arxiv.org/abs/2209.00588', why: 'Reframes the world model as a Transformer over discrete image tokens — a tiny language model of the game. The token-based mainline.', type: 'landmark', core: true },
      { id: 'twm', t: 'Transformer-based World Models Are Happy With 100K Interactions', s: 'TWM', meta: 'Robine et al. · 2023 · ICLR', url: 'https://arxiv.org/abs/2202.09481', why: 'A parallel transformer-world-model take on Atari-100k. Good for seeing which design choices are load-bearing vs. incidental.', type: 'alternative', core: false },
      { id: 'storm', t: 'STORM: Efficient Stochastic Transformer-based World Models', s: 'STORM', meta: 'Zhang et al. · 2023 · NeurIPS', url: 'https://arxiv.org/abs/2310.09615', why: 'Stochastic transformer world model with strong Atari-100k numbers at modest compute — a realistic target for laptop-scale reproduction.', type: 'improvement', core: true },
      { id: 'delta-iris', t: 'Efficient World Models with Context-Aware Tokenization', s: 'Δ-IRIS', meta: 'Micheli et al. · 2024', url: 'https://arxiv.org/abs/2406.19320', why: 'Tokenize only what changes between frames. The efficiency refinement of the IRIS line.', type: 'improvement', core: false },
      { id: 'diamond', t: 'Diffusion for World Modeling: Visual Details Matter in Atari', s: 'DIAMOND', meta: 'Alonso et al. · 2024 · NeurIPS', url: 'https://arxiv.org/abs/2405.12399', why: 'Ditch discrete tokens for a diffusion model over frames — small objects (ball, bullets) survive. Also famously produced a playable neural CS:GO.', type: 'landmark', core: true },
      { id: 'genie', t: 'Genie: Generative Interactive Environments', s: 'Genie', meta: 'Bruce et al. · 2024 · ICML', url: 'https://arxiv.org/abs/2402.15391', why: 'Learns controllable world models from unlabeled video with latent actions. The scaling-up-generative-worlds direction that leads toward the Track 8 frontier.', type: 'frontier', core: false },
    ],
  },
  {
    n: '06',
    title: 'Sample Efficiency & Self-Predictive Representations',
    sub: 'What makes Atari-100k tractable — and the JEPA-adjacent model-free SOTA.',
    papers: [
      { id: 'drq', t: 'Image Augmentation Is All You Need: Regularizing Deep RL from Pixels', s: 'DrQ', meta: 'Kostrikov et al. · 2021 · ICLR', url: 'https://arxiv.org/abs/2004.13649', why: 'Simple data augmentation unlocks sample-efficient pixel RL. The augmentation baseline the rest of the track builds on.', type: 'foundational', core: true },
      { id: 'curl', t: 'CURL: Contrastive Unsupervised Representations for Reinforcement Learning', s: 'CURL', meta: 'Laskin & Srinivas et al. · 2020', url: 'https://arxiv.org/abs/2004.04136', why: 'Auxiliary contrastive representation learning for RL. Historical context for why self-supervision entered the sample-efficiency story.', type: 'context', core: false },
      { id: 'spr', t: 'Data-Efficient Reinforcement Learning with Self-Predictive Representations', s: 'SPR', meta: 'Schwarzer et al. · 2021 · ICLR', url: 'https://arxiv.org/abs/2007.05929', why: 'Predict your own future latents with an EMA target encoder — JEPA in spirit, before the name. The conceptual hinge into Track 7.', type: 'landmark', core: true },
      { id: 'bbf', t: 'Bigger, Better, Faster: Human-level Atari with Human-level Efficiency', s: 'BBF', meta: 'Schwarzer et al. · 2023 · ICML', url: 'https://arxiv.org/abs/2305.19452', why: "The model-free Atari-100k SOTA. Scales the network + periodic resets on top of SR-SPR's self-predictive objective. Super-human IQM without a world model.", type: 'landmark', core: true },
    ],
  },
  {
    n: '07',
    title: 'JEPA & Non-Reconstructive Prediction',
    sub: "Predict in latent space, not pixels — the frontier's contested thesis.",
    papers: [
      { id: 'lecun-path', t: 'A Path Towards Autonomous Machine Intelligence', s: 'Position paper', meta: 'LeCun · 2022 · position paper', url: 'https://openreview.net/forum?id=BZ5a1r-kVsf', why: 'The manifesto that frames JEPA. Read §III–IV for the argument that predicting pixels is the wrong objective for world models.', type: 'vision', core: true },
      { id: 'byol', t: 'Bootstrap Your Own Latent (BYOL)', s: 'BYOL', meta: 'Grill et al. · 2020 · NeurIPS', url: 'https://arxiv.org/abs/2006.07733', why: 'The self-predictive, no-negatives recipe — and the collapse-avoidance machinery (EMA target, stop-grad) that all of JEPA inherits.', type: 'foundational', core: false },
      { id: 'ijepa', t: 'Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture', s: 'I-JEPA', meta: 'Assran et al. · 2023 · CVPR', url: 'https://arxiv.org/abs/2301.08243', why: 'The canonical JEPA. Read for the exact definition: context/target encoders, latent-space prediction, and why it beats pixel reconstruction on representations.', type: 'landmark', core: true },
      { id: 'vjepa2', t: 'V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning', s: 'V-JEPA 2', meta: 'Assran et al. · 2025 · Meta', url: 'https://arxiv.org/abs/2506.09985', why: "The flagship JEPA world model. V-JEPA 2-AC adds action-conditioning in latent space and plans zero-shot on real robots — JEPA's strongest 'it actually controls things' result.", type: 'landmark', core: true },
      { id: 'jepa-rl', t: 'JEPA for RL: Investigating Joint-Embedding Predictive Architectures for RL', meta: '2025', url: 'https://arxiv.org/abs/2504.16591', why: 'The direct attempt to port JEPA into RL-from-pixels, confronting the collapse problem head-on. Early-stage — and a signpost to the open research gap on Atari.', type: 'frontier', core: true },
      { id: 'byol-explore', t: 'BYOL-Explore: Exploration by Bootstrapped Prediction', s: 'BYOL-Explore', meta: 'Guo et al. · 2022 · NeurIPS', url: 'https://arxiv.org/abs/2206.08332', why: 'Self-predictive latents doubling as an exploration bonus. Shows the JEPA-family objective doing more than representation learning.', type: 'extension', core: false },
      { id: 'action-relevant', t: 'What Makes Video World Model Latents Action-Relevant: Prediction over Reconstruction', meta: '2026', url: 'https://arxiv.org/abs/2606.07687', why: 'Recent evidence for the JEPA thesis in control: predictive latents encode action-relevant structure that reconstructive ones wash out.', type: 'frontier', core: false },
    ],
  },
  {
    n: '08',
    title: 'Generalist & Foundation Game Agents',
    sub: 'One model, many games — and whether Atari world models scale.',
    papers: [
      { id: 'dt', t: 'Decision Transformer: Reinforcement Learning via Sequence Modeling', s: 'Decision Transformer', meta: 'Chen et al. · 2021 · NeurIPS', url: 'https://arxiv.org/abs/2106.01345', why: 'Recast RL as return-conditioned sequence modeling. The architecture the multi-game generalists are built on.', type: 'foundational', core: true },
      { id: 'mgdt', t: 'Multi-Game Decision Transformers', s: 'Multi-Game DT', meta: 'Lee et al. · 2022 · NeurIPS', url: 'https://arxiv.org/abs/2205.15241', why: "One Transformer plays 41 Atari games near-human, and gets BETTER with scale. The cleanest 'foundation model across Atari' evidence.", type: 'landmark', core: true },
      { id: 'gato', t: 'A Generalist Agent', s: 'Gato', meta: 'Reed et al. · 2022 · DeepMind', url: 'https://arxiv.org/abs/2205.06175', why: "One network for Atari + captioning + chat + robotics. The boldest 'one model for everything' statement; read for the ambition and its limits.", type: 'landmark', core: true },
      { id: 'game-tars', t: 'Game-TARS: Pretrained Foundation Models for Scalable Generalist Multimodal Game Agents', s: 'Game-TARS', meta: '2025', url: 'https://arxiv.org/abs/2510.23691', why: 'Unified keyboard-mouse action space, 500B+ pretraining tokens, generalizes to unseen 3D games. Where the generalist frontier moved past Atari.', type: 'frontier', core: false },
      { id: 'nitrogen', t: 'NitroGen: An Open Foundation Model for Generalist Gaming Agents', s: 'NitroGen', meta: '2025 · project page', url: 'https://nitrogen.minedojo.org/', why: 'Open foundation model trained on 40,000 hours of gameplay video across 1,000+ games. The open-ecosystem counterpart to Game-TARS.', type: 'frontier', core: false },
      { id: 'sima2', t: 'SIMA 2: A Generalist Embodied Agent for Virtual Worlds', s: 'SIMA 2', meta: '2025 · DeepMind', url: 'https://arxiv.org/abs/2512.04797', why: "Generalist embodied agent for 3D worlds. The trajectory's current endpoint — Atari is now a slice, not the goal.", type: 'frontier', core: false },
      { id: 'probing-scale', t: 'Probing the Impact of Scale on Data-Efficient, Generalist Transformer World Models for Atari', meta: '2026', url: 'https://arxiv.org/abs/2605.08578', why: 'The paper that answers the original question head-on: do transformer world models follow clean scaling laws on Atari? Read it last — it ties Tracks 5, 6, and 8 together.', type: 'frontier', core: true },
    ],
  },
];

export const TOTAL = TRACKS.reduce((n, t) => n + t.papers.length, 0);
export const CORE_TOTAL = TRACKS.reduce((n, t) => n + t.papers.filter((p) => p.core).length, 0);
