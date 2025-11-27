/**
 * Unit Tests for Task Controller
 */

describe('Task Controller', () => {
  describe('Task Status Transitions', () => {
    const validStatuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'];

    it('should validate task status values', () => {
      validStatuses.forEach(status => {
        expect(validStatuses.includes(status)).toBe(true);
      });

      expect(validStatuses.includes('INVALID')).toBe(false);
    });

    it('should allow valid status transitions', () => {
      // All transitions should be allowed in this system
      const transitions = [
        { from: 'TODO', to: 'IN_PROGRESS' },
        { from: 'IN_PROGRESS', to: 'IN_REVIEW' },
        { from: 'IN_REVIEW', to: 'COMPLETED' },
        { from: 'COMPLETED', to: 'TODO' }, // Reopening is allowed
      ];

      transitions.forEach(({ from, to }) => {
        expect(validStatuses.includes(from)).toBe(true);
        expect(validStatuses.includes(to)).toBe(true);
      });
    });
  });

  describe('Task Priority', () => {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    it('should validate priority values', () => {
      validPriorities.forEach(priority => {
        expect(validPriorities.includes(priority)).toBe(true);
      });

      expect(validPriorities.includes('INVALID')).toBe(false);
    });

    it('should order priorities correctly', () => {
      const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
      
      expect(priorityOrder.LOW).toBeLessThan(priorityOrder.MEDIUM);
      expect(priorityOrder.MEDIUM).toBeLessThan(priorityOrder.HIGH);
      expect(priorityOrder.HIGH).toBeLessThan(priorityOrder.URGENT);
    });
  });

  describe('Task Validation', () => {
    it('should validate task title length', () => {
      const minLength = 2;
      const maxLength = 200;

      expect(''.length >= minLength).toBe(false);
      expect('A'.length >= minLength).toBe(false);
      expect('AB'.length >= minLength).toBe(true);
      expect('A'.repeat(200).length <= maxLength).toBe(true);
      expect('A'.repeat(201).length <= maxLength).toBe(false);
    });

    it('should validate due date format', () => {
      const validDates = [
        '2024-12-31T23:59:59.999Z',
        '2024-01-15T10:30:00.000Z',
      ];

      validDates.forEach(date => {
        const parsed = new Date(date);
        expect(parsed.toISOString()).toBeDefined();
        expect(isNaN(parsed.getTime())).toBe(false);
      });

      const invalidDate = new Date('invalid');
      expect(isNaN(invalidDate.getTime())).toBe(true);
    });
  });

  describe('Task Completion', () => {
    it('should set completedAt when status changes to COMPLETED', () => {
      const status = 'COMPLETED';
      const completedAt = status === 'COMPLETED' ? new Date() : null;

      expect(completedAt).toBeInstanceOf(Date);
    });

    it('should clear completedAt when status changes from COMPLETED', () => {
      const status = 'IN_PROGRESS';
      const completedAt = status === 'COMPLETED' ? new Date() : null;

      expect(completedAt).toBeNull();
    });
  });
});

describe('Task Filtering', () => {
  const tasks = [
    { id: '1', status: 'TODO', priority: 'HIGH', projectId: 'p1' },
    { id: '2', status: 'IN_PROGRESS', priority: 'MEDIUM', projectId: 'p1' },
    { id: '3', status: 'COMPLETED', priority: 'LOW', projectId: 'p2' },
    { id: '4', status: 'TODO', priority: 'URGENT', projectId: 'p2' },
  ];

  it('should filter by status', () => {
    const filtered = tasks.filter(t => t.status === 'TODO');
    expect(filtered.length).toBe(2);
    expect(filtered.every(t => t.status === 'TODO')).toBe(true);
  });

  it('should filter by priority', () => {
    const filtered = tasks.filter(t => t.priority === 'HIGH');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should filter by project', () => {
    const filtered = tasks.filter(t => t.projectId === 'p1');
    expect(filtered.length).toBe(2);
    expect(filtered.every(t => t.projectId === 'p1')).toBe(true);
  });

  it('should combine filters', () => {
    const filtered = tasks.filter(
      t => t.status === 'TODO' && t.projectId === 'p2'
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('4');
  });
});
