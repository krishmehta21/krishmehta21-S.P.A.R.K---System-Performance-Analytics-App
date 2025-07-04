import React, { useEffect, useState, memo, useMemo } from 'react';
import {
  Box,
  Text,
  Heading,
  Button,
  Skeleton,
  SkeletonText,
  Badge,
  VStack,
  SimpleGrid,
  Progress,
  Stat as ChakraStat,
  StatLabel,
  StatNumber,
  useTheme,
  Flex,
  Switch,
  IconButton,
  Divider,
  useColorMode,
  useColorModeValue,
  Tooltip,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Collapse,
  HStack,
  Spacer,
  Circle,
} from '@chakra-ui/react';
import {
  SunIcon,
  MoonIcon,
  RepeatIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SettingsIcon,
} from '@chakra-ui/icons';

import {
  MdMemory as MemoryIcon,
  MdStorage as HardDriveIcon,
  MdWifi as WifiIcon,
  MdBatteryFull as BatteryFullIcon,
  MdDeveloperBoard as CpuIcon,
} from 'react-icons/md';
import { FaMicrochip } from 'react-icons/fa';

import { motion, useSpring, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SystemMetrics {
  timestamp: string;
  cpu: {
    total_percent: number;
    per_core_percent: number[];
    cores: number;
    threads: number;
  };
  ram: {
    total_gb: number;
    used_gb: number;
    percent: number;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    percent: number;
    read_mb: number;
    write_mb: number;
  };
  network: {
    sent_mb: number;
    recv_mb: number;
  };
  battery?: {
    percent: number;
    plugged_in: boolean;
    secs_left: number;
  };
  uptime: {
    start_time: string;
    uptime_str: string;
  };
  system: {
    hostname: string;
    os: string;
    os_version: string;
    platform: string;
    architecture: string;
    processor: string;
    user: string;
  };
}
const MotionBox = motion(Box);

const AnimatedStatNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, { damping: 20, stiffness: 100 });
  const rounded = useTransform(spring, (latest: number) => Math.round(latest * 10) / 10);
  const [renderValue, setRenderValue] = useState('');

  useEffect(() => {
    const unsubscribe = rounded.onChange((latest: number) => {
      setRenderValue(latest.toFixed(1));
    });
    return unsubscribe;
  }, [rounded]);

  return <motion.span>{renderValue}</motion.span>;
};

interface SmoothProgressProps {
  value: number;
  colorScheme?: string;
}

const SmoothProgress = ({ value, colorScheme }: SmoothProgressProps) => {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, {
    damping: 20,
    stiffness: 120,
  });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.onChange((latest: number) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [spring]);

  return (
    <Progress value={displayValue} colorScheme={colorScheme} size="sm" mb={2} />
  );
};

const StatDisplay = memo(
  ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
    <ChakraStat>
      <StatLabel fontSize="sm" fontWeight="bold">
        {label}
      </StatLabel>
      <StatNumber color={color} fontSize="2xl">
        {typeof value === 'number' ? <AnimatedStatNumber value={value} /> : value}
      </StatNumber>
    </ChakraStat>
  )
);

const SIDEBAR_ITEMS = [
  { key: 'cpu', label: 'CPU', icon: CpuIcon },
  { key: 'ram', label: 'RAM', icon: MemoryIcon },
  { key: 'disk', label: 'Disk', icon: HardDriveIcon },
  { key: 'network', label: 'Network', icon: WifiIcon },
  { key: 'battery', label: 'Battery', icon: BatteryFullIcon },
  { key: 'system', label: 'System', icon: SettingsIcon },
  { key: 'processes', label: 'Processes', icon: FaMicrochip },
];

const Sidebar = ({ visibleCards, setVisibleCards }: any) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.900');
  const border = useColorModeValue('gray.200', 'gray.700');
  return (
    <>
      <Box
        display={{ base: 'none', md: 'flex' }}
        flexDir="column"
        pos="sticky"
        top={0}
        h="100vh"
        minW="220px"
        bg={bg}
        borderRightWidth={1}
        borderColor={border}
        p={4}
        zIndex={10}
      >
        <Heading size="md" mb={6} letterSpacing="tight">
          S.P.A.R.K
        </Heading>
        {SIDEBAR_ITEMS.map((item) => (
          <HStack key={item.key} mb={3}>
            <item.icon size={24} />
            <Text flex="1">{item.label}</Text>
            <Switch
              isChecked={visibleCards[item.key]}
              onChange={() =>
                setVisibleCards((v: any) => ({
                  ...v,
                  [item.key]: !v[item.key],
                }))
              }
            />
          </HStack>
        ))}
        <Spacer />
        <Divider my={4} />
        <Text fontSize="xs" color="gray.400">
          v0.1
        </Text>
      </Box>
      {/* Mobile Drawer */}
      <Box display={{ base: 'block', md: 'none' }} pos="fixed" top={2} left={2} zIndex={20}>
        <IconButton icon={<SettingsIcon />} aria-label="Menu" onClick={onOpen} />
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>S.P.A.R.K</DrawerHeader>
            <DrawerBody>
              {SIDEBAR_ITEMS.map((item) => (
                <HStack key={item.key} mb={3}>
                  <item.icon size={24} />
                  <Text flex="1">{item.label}</Text>
                  <Switch
                    isChecked={visibleCards[item.key]}
                    onChange={() =>
                      setVisibleCards((v: any) => ({
                        ...v,
                        [item.key]: !v[item.key],
                      }))
                    }
                  />
                </HStack>
              ))}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </>
  );
};

const TopBar = ({ lastUpdated, onRefresh }: any) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex mb={6} align="center" justify="space-between">
      <HStack>
        <Heading size="md">🖥️ S.P.A.R.K - System Dashboard</Heading>
        <Tooltip label="Toggle color mode">
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            aria-label="Toggle color mode"
            size="sm"
            ml={2}
            onClick={toggleColorMode}
          />
        </Tooltip>
      </HStack>
      <HStack>
        <Text fontSize="sm" color="gray.500">
          Last updated: {lastUpdated}
        </Text>
        <Tooltip label="Refresh now">
          <IconButton icon={<RepeatIcon />} aria-label="Refresh" size="sm" onClick={onRefresh} />
        </Tooltip>
      </HStack>
    </Flex>
  );
};

const Card = memo(({ title, children }: { title: string; children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  const bg = useColorModeValue('white', 'gray.800');
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return (
    <MotionBox
      layout
      bg={bg}
      p={5}
      rounded="2xl"
      shadow="md"
      w="full"
      initial={{ opacity: 0, y: 10 }}
      animate={hasMounted ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      <Heading fontSize="xl" mb={3}>
        {title}
      </Heading>
      {children}
    </MotionBox>
  );
});
const CpuCard = memo(({ metrics, history }: any) => {
  const [showCores, setShowCores] = useState(false);
  const statusColor = metrics.cpu.total_percent > 80 ? 'red.400' : 'green.400';
  const bg = useColorModeValue('white', 'gray.800');
  const filteredHistory = (history || []).filter(
    (h: any) => typeof h.usage === 'number' && !isNaN(h.usage)
  );
  const perCoreHistory = metrics.cpu.per_core_history || [];
  const perCorePercent = metrics.cpu.per_core_percent || [];
  const coreCount = (typeof metrics.cpu.cores === 'number' && metrics.cpu.cores > 0)
    ? metrics.cpu.cores
    : (Array.isArray(perCorePercent) ? perCorePercent.length : '-');
  const threadCount = (typeof metrics.cpu.threads === 'number' && metrics.cpu.threads > 0)
    ? metrics.cpu.threads
    : '-';

  return (
    <MotionBox
      layout
      bgGradient={useColorModeValue(
        'linear(to-br, white, gray.100)',
        'linear(to-br, gray.800, gray.900)'
      )}
      p={6}
      rounded="2xl"
      shadow="xl"
      w="full"
      minH="240px"
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
      transition={{ duration: 0.3 }}
    >
      <HStack mb={3}>
        <Circle size="36px" bg={statusColor} color="white">
          <CpuIcon size={20} />
        </Circle>
        <Heading fontSize="xl" flex="1">
          CPU Usage
        </Heading>
        <Tooltip label="Show per-core details">
          <IconButton
            icon={showCores ? <ChevronUpIcon /> : <ChevronDownIcon />}
            aria-label="Toggle per-core"
            size="sm"
            variant="ghost"
            onClick={() => setShowCores((v) => !v)}
          />
        </Tooltip>
      </HStack>
      <Box display="flex" gap={6} mb={3}>
        <Box>
          <Text fontSize="sm" color="gray.400">Cores</Text>
          <Text fontWeight="bold" fontSize="2xl">{coreCount}</Text>
        </Box>
        <Box>
          <Text fontSize="sm" color="gray.400">Threads</Text>
          <Text fontWeight="bold" fontSize="2xl">{threadCount}</Text>
        </Box>
        <Box flex="1">
          <StatDisplay label="Total Usage" value={metrics.cpu.total_percent} color={statusColor} />
          <SmoothProgress value={metrics.cpu.total_percent} colorScheme={metrics.cpu.total_percent > 80 ? 'red' : 'green'} />
        </Box>
      </Box>
      <Divider my={2} />
      <AnimatePresence initial={false}>
        {showCores && (
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            overflow="hidden"
            mt={2}
          >
            <Text as="span" fontWeight="bold" fontSize="sm">
              Per Core:
            </Text>
            <VStack align="start" spacing={2} mt={2}>
              {perCorePercent.map((p: number, i: number) => (
                <HStack key={i} spacing={2} align="center">
                  <Badge colorScheme={p > 80 ? 'red' : p > 50 ? 'yellow' : 'blue'}>
                    Core {i + 1}: <AnimatedStatNumber value={p} />%
                  </Badge>
                  {perCoreHistory[i] && perCoreHistory[i].length > 0 && (
                    <Box w="60px" h="24px">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={perCoreHistory[i]}>
                          <Line type="monotone" dataKey="usage" stroke={p > 80 ? '#E53E3E' : p > 50 ? '#ECC94B' : '#3182CE'} strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </HStack>
              ))}
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>
      <Box mt={4} height="120px" minH="120px" borderRadius="lg" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}> 
        {filteredHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory}>
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} />
              <ReTooltip />
              <Line
                type="monotone"
                dataKey="usage"
                stroke={statusColor === 'red.400' ? '#E53E3E' : '#38A169'}
                strokeWidth={2}
                dot={false}
                isAnimationActive
                animationDuration={400}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Text color="gray.400" textAlign="center" mt={8}>No data</Text>
        )}
      </Box>
    </MotionBox>
  );
});

const RamCard = memo(({ metrics, history }: any) => {
  const [tab, setTab] = useState(0);
  const statusColor = metrics.ram.percent > 80 ? 'red.400' : 'purple.400';
  const bg = useColorModeValue('white', 'gray.800');
  const pieData = [
    { name: 'Used', value: metrics.ram.used_gb },
    { name: 'Free', value: metrics.ram.total_gb - metrics.ram.used_gb },
  ];
  const pieColors = ['#9F7AEA', '#E2E8F0'];
  const filteredHistory = (history || []).filter(
    (h: any) => typeof h.percent === 'number' && !isNaN(h.percent)
  );
  return (
    <MotionBox
      layout
      bg={bg}
      p={4}
      rounded="2xl"
      shadow="md"
      w="full"
      minH="220px"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.3 }}
    >
      <HStack mb={2}>
        <MemoryIcon size={24} />
        <Heading fontSize="lg" flex="1">
          RAM Usage
        </Heading>
        <Circle size="10px" bg={statusColor} />
      </HStack>
      <StatDisplay label="Usage" value={metrics.ram.percent} color={statusColor} />
      <SmoothProgress value={metrics.ram.percent} colorScheme={metrics.ram.percent > 80 ? 'red' : 'purple'} />
      <Tabs size="sm" mt={2} onChange={setTab} index={tab} variant="soft-rounded" colorScheme="purple">
        <TabList>
          <Tab>History</Tab>
          <Tab>Pie</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <Box height="120px" minH="120px" borderRadius="lg" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}> 
              {filteredHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredHistory}>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 100]} />
                    <ReTooltip />
                    <Line type="monotone" dataKey="percent" stroke={statusColor === 'red.400' ? '#E53E3E' : '#9F7AEA'} strokeWidth={2} dot={false} isAnimationActive animationDuration={400} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Text color="gray.400" textAlign="center" mt={8}>No data</Text>
              )}
            </Box>
          </TabPanel>
          <TabPanel px={0}>
            <Box height="120px" minH="120px" display="flex" alignItems="center" justifyContent="center" borderRadius="lg" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}> 
              <PieChart width={120} height={120}>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={30} label>
                  {pieData.map((entry, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
              </PieChart>
            </Box>
            <HStack justify="center" mt={2} fontSize="sm">
              <Badge colorScheme="purple">Used: {metrics.ram.used_gb} GB</Badge>
              <Badge colorScheme="gray">Free: {(metrics.ram.total_gb - metrics.ram.used_gb).toFixed(1)} GB</Badge>
            </HStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </MotionBox>
  );
});

const DiskCard = memo(({ metrics, history }: any) => {
  const statusColor = metrics.disk.percent > 80 ? 'red.400' : 'yellow.400';
  const bg = useColorModeValue('white', 'gray.800');
  const filteredHistory = (history || []).filter(
    (h: any) => typeof h.percent === 'number' && !isNaN(h.percent)
  );
  return (
    <MotionBox
      layout
      bg={bg}
      p={4}
      rounded="2xl"
      shadow="md"
      w="full"
      minH="220px"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.3 }}
    >
      <HStack mb={2}>
        <HardDriveIcon size={24} />
        <Heading fontSize="lg" flex="1">
          Disk Usage
        </Heading>
        <Circle size="10px" bg={statusColor} />
      </HStack>
      <StatDisplay label="Usage" value={metrics.disk.percent} color={statusColor} />
      <SmoothProgress value={metrics.disk.percent} colorScheme={metrics.disk.percent > 80 ? 'red' : 'yellow'} />
      <StatDisplay label="Read" value={metrics.disk.read_mb} />
      <StatDisplay label="Write" value={metrics.disk.write_mb} />
      <Box mt={4} height="120px" minH="120px" borderRadius="lg" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}> 
        {filteredHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory}>
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} />
              <ReTooltip />
              <Line type="monotone" dataKey="percent" stroke={statusColor === 'red.400' ? '#E53E3E' : '#ECC94B'} strokeWidth={2} dot={false} isAnimationActive animationDuration={400} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Text color="gray.400" textAlign="center" mt={8}>No data</Text>
        )}
      </Box>
    </MotionBox>
  );
});

const NetworkCard = memo(({ metrics, history }: any) => {
  const bg = useColorModeValue('white', 'gray.800');
  const filteredHistory = (history || []).filter(
    (h: any) => typeof h.sent === 'number' && typeof h.recv === 'number' && !isNaN(h.sent) && !isNaN(h.recv)
  );
  return (
    <MotionBox
      layout
      bg={bg}
      p={4}
      rounded="2xl"
      shadow="md"
      w="full"
      minH="220px"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.3 }}
    >
      <HStack mb={2}>
        <WifiIcon size={24} />
        <Heading fontSize="lg" flex="1">
          Network
        </Heading>
      </HStack>
      <StatDisplay label="Sent" value={metrics.network.sent_mb} color="purple.500" />
      <StatDisplay label="Received" value={metrics.network.recv_mb} color="orange.500" />
      <Box mt={4} height="120px" minH="120px" borderRadius="lg" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}> 
        {filteredHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory}>
              <XAxis dataKey="time" hide />
              <YAxis />
              <ReTooltip />
              <Line type="monotone" dataKey="sent" stroke="#9F7AEA" strokeWidth={2} dot={false} isAnimationActive animationDuration={400} />
              <Line type="monotone" dataKey="recv" stroke="#ED8936" strokeWidth={2} dot={false} isAnimationActive animationDuration={400} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Text color="gray.400" textAlign="center" mt={8}>No data</Text>
        )}
      </Box>
    </MotionBox>
  );
});
const BatteryCard = memo(({ metrics }: any) => {
  if (!metrics.battery) return null;

  const { percent, plugged_in, secs_left } = metrics.battery;

  const statusColor =
    percent < 20 ? 'red.400' : plugged_in ? 'green.400' : 'yellow.400';
  const bg = useColorModeValue('white', 'gray.800');

  const formatTime = (secs: number) => {
    if (
      secs === undefined ||
      secs === null ||
      secs === -1 || // POWER_TIME_UNLIMITED
      secs === -2 || // POWER_TIME_UNKNOWN
      secs === 0 ||  // Treat zero as unknown
      secs < 60 ||   // Less than 1 min is unknown
      secs > 86400   // More than a day
    ) {
      return null;
    }

    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);

    if (h > 0 && m > 0) {
      return `${h}h ${m}m`;
    } else if (h > 0 && m === 0) {
      return `${h}h`;
    } else if (m > 0) {
      return `${m}m`;
    } else {
      return '< 1m';
    }
  };

  const timeString = formatTime(secs_left);

  return (
    <MotionBox
      layout
      bg={bg}
      p={4}
      rounded="2xl"
      shadow="md"
      w="full"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.3 }}
    >
      <HStack mb={2}>
        <BatteryFullIcon size={24} />
        <Heading fontSize="lg" flex="1">
          Battery ({percent}%)
        </Heading>
        <Circle size="10px" bg={statusColor} />
      </HStack>

      <StatDisplay label="Battery" value={`${percent}%`} color={statusColor} />
      <SmoothProgress
        value={percent}
        colorScheme={percent < 20 ? 'red' : plugged_in ? 'green' : 'yellow'}
      />

      <HStack mt={2}>
        <Badge colorScheme={plugged_in ? 'green' : 'yellow'}>
          {plugged_in ? 'Charging' : 'Discharging'}
        </Badge>
        <Text fontSize="sm" color="gray.400">
          {plugged_in
            ? timeString
              ? `Time to full: ${timeString}`
              : 'Charging – time unknown'
            : timeString
            ? `Time left: ${timeString}`
            : 'Discharging – time unknown'}
        </Text>
      </HStack>
    </MotionBox>
  );
});


const SystemCard = memo(({ metrics }: any) => {
  const bg = useColorModeValue('white', 'gray.800');
  return (
    <MotionBox
      layout
      bg={bg}
      p={4}
      rounded="2xl"
      shadow="md"
      w="full"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.3 }}
    >
      <Heading fontSize="lg" mb={4}>
        System Info
      </Heading>
      <VStack align="start" spacing={1} fontSize="md">
        <StatDisplay label="Uptime" value={metrics.uptime.uptime_str} />
        <StatDisplay label="Host" value={metrics.system.hostname} />
        <StatDisplay label="User" value={metrics.system.user} />
        <StatDisplay label="OS" value={`${metrics.system.os} (${metrics.system.os_version})`} />
      </VStack>
    </MotionBox>
  );
});

const Footer = ({ lastUpdated }: any) => {
  const bg = useColorModeValue('whiteAlpha.800', 'gray.900');
  return (
    <Box
      as="footer"
      pos="fixed"
      left={0}
      bottom={0}
      w="100%"
      py={2}
      px={4}
      bg={bg}
      borderTopWidth={1}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      textAlign="center"
      fontSize="xs"
      zIndex={100}
    >
      ⚙️ S.P.A.R.K v0.1 • Electron + Django • {new Date().getFullYear()} | Last updated: {lastUpdated}
    </Box>
  );
};

const ProcessCard = memo(({ processes }: { processes: any[] }) => {
  const bg = useColorModeValue('white', 'gray.800');
  return (
    <MotionBox
      layout
      bg={bg}
      p={4}
      rounded="2xl"
      shadow="md"
      w="full"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.3 }}
    >
      <HStack mb={2}>
        <FaMicrochip size={24} />
        <Heading fontSize="lg" flex="1">
          Top 5 Processes
        </Heading>
      </HStack>
      <Box overflowX="auto">
        <table style={{ width: '100%', fontSize: '0.95em' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#888' }}>
              <th>Name</th>
              <th>PID</th>
              <th>CPU %</th>
              <th>RAM MB</th>
            </tr>
          </thead>
          <tbody>
            {processes.slice(0, 5).map((proc, i) => (
              <tr key={proc.pid} style={{ background: i % 2 ? 'rgba(0,0,0,0.03)' : 'none' }}>
                <td>{proc.name}</td>
                <td>{proc.pid}</td>
                <td style={{ color: typeof proc.cpu === 'number' && proc.cpu > 50 ? '#E53E3E' : '#38A169', fontWeight: 'bold' }}>
                  {typeof proc.cpu === 'number' ? proc.cpu.toFixed(1) : '-'}
                </td>
                <td>
                  {typeof proc.memory_mb === 'number' ? proc.memory_mb.toFixed(1) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </MotionBox>
  );
});

export default function App() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [cpuHistory, setCpuHistory] = useState<{ time: string; usage: number }[]>([]);
  const [ramHistory, setRamHistory] = useState<{ time: string; percent: number }[]>([]);
  const [diskHistory, setDiskHistory] = useState<{ time: string; percent: number }[]>([]);
  const [netHistory, setNetHistory] = useState<{ time: string; sent: number; recv: number }[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [visibleCards, setVisibleCards] = useState({
    cpu: true,
    ram: true,
    disk: true,
    network: true,
    battery: true,
    system: true,
    processes: true,
  });

  // Move hooks here
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const fetchMetrics = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/metrics/');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMetrics((prev) => {
        const dataStr = JSON.stringify(data);
        const prevStr = JSON.stringify(prev);
        return dataStr !== prevStr ? data : prev;
      });
      setError(false);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchProcesses = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/metrics/processes/');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProcesses(Array.isArray(data) ? data : data.processes || []);
    } catch (err) {
      setProcesses([]);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchProcesses();
    const interval = setInterval(() => {
      fetchMetrics();
      fetchProcesses();
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (metrics) {
      const now = new Date().toLocaleTimeString();
      setCpuHistory((prev) => [...prev.slice(-19), { time: now, usage: metrics.cpu.total_percent }]);
      setRamHistory((prev) => [...prev.slice(-19), { time: now, percent: metrics.ram.percent }]);
      setDiskHistory((prev) => [...prev.slice(-19), { time: now, percent: metrics.disk.percent }]);
      setNetHistory((prev) => [
        ...prev.slice(-19),
        { time: now, sent: metrics.network.sent_mb, recv: metrics.network.recv_mb },
      ]);
    }
  }, [metrics?.timestamp]);

  // Only render JSX conditionally, not hooks
  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minH="100vh" bg={bgColor} color={textColor}>
        <Box w="full" maxW="600px">
          <Skeleton height="40px" mb={4} />
          <SkeletonText mt={4} noOfLines={8} />
        </Box>
      </Box>
    );
  }

  if (error || !metrics) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        color="red.500"
        bg={bgColor}
      >
        <Text fontSize="xl">❌ Failed to fetch metrics.</Text>
        <Text>Please check if the Django server is running.</Text>
        <Button onClick={fetchMetrics} mt={4}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Flex minH="100vh" bg={bgColor} color={textColor}>
      <Sidebar visibleCards={visibleCards} setVisibleCards={setVisibleCards} />
      <Box flex="1" p={[2, 6]} bg={bgColor} color={textColor}>
        <TopBar lastUpdated={lastUpdated} onRefresh={fetchMetrics} />
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <AnimatePresence>
            {visibleCards.cpu && <CpuCard metrics={metrics} history={cpuHistory} key="cpu" />}
            {visibleCards.ram && <RamCard metrics={metrics} history={ramHistory} key="ram" />}
            {visibleCards.disk && <DiskCard metrics={metrics} history={diskHistory} key="disk" />}
            {visibleCards.network && <NetworkCard metrics={metrics} history={netHistory} key="network" />}
            {visibleCards.battery && <BatteryCard metrics={metrics} key="battery" />}
            {visibleCards.system && <SystemCard metrics={metrics} key="system" />}
            {visibleCards.processes && processes.length > 0 && <ProcessCard processes={processes} key="processes" />}
          </AnimatePresence>
        </SimpleGrid>
        <Box h="60px" /> {/* Spacer for fixed footer */}
        <Footer lastUpdated={lastUpdated} />
      </Box>
    </Flex>
  );
}
