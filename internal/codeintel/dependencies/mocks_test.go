// Code generated by go-mockgen 1.3.4; DO NOT EDIT.
//
// This file was generated by running `sg generate` (or `go-mockgen`) at the root of
// this repository. To add additional mocks to this or another package, add a new entry
// to the mockgen.yaml file in the root of this repository.

package dependencies

import (
	"context"
	"sync"

	store "github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies/internal/store"
	shared "github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies/shared"
)

// MockStore is a mock implementation of the Store interface (from the
// package
// github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies/internal/store)
// used for unit testing.
type MockStore struct {
	// DeleteDependencyReposByIDFunc is an instance of a mock function
	// object controlling the behavior of the method
	// DeleteDependencyReposByID.
	DeleteDependencyReposByIDFunc *StoreDeleteDependencyReposByIDFunc
	// ListDependencyReposFunc is an instance of a mock function object
	// controlling the behavior of the method ListDependencyRepos.
	ListDependencyReposFunc *StoreListDependencyReposFunc
	// UpsertDependencyReposFunc is an instance of a mock function object
	// controlling the behavior of the method UpsertDependencyRepos.
	UpsertDependencyReposFunc *StoreUpsertDependencyReposFunc
}

// NewMockStore creates a new mock of the Store interface. All methods
// return zero values for all results, unless overwritten.
func NewMockStore() *MockStore {
	return &MockStore{
		DeleteDependencyReposByIDFunc: &StoreDeleteDependencyReposByIDFunc{
			defaultHook: func(context.Context, ...int) (r0 error) {
				return
			},
		},
		ListDependencyReposFunc: &StoreListDependencyReposFunc{
			defaultHook: func(context.Context, store.ListDependencyReposOpts) (r0 []shared.Repo, r1 error) {
				return
			},
		},
		UpsertDependencyReposFunc: &StoreUpsertDependencyReposFunc{
			defaultHook: func(context.Context, []shared.Repo) (r0 []shared.Repo, r1 error) {
				return
			},
		},
	}
}

// NewStrictMockStore creates a new mock of the Store interface. All methods
// panic on invocation, unless overwritten.
func NewStrictMockStore() *MockStore {
	return &MockStore{
		DeleteDependencyReposByIDFunc: &StoreDeleteDependencyReposByIDFunc{
			defaultHook: func(context.Context, ...int) error {
				panic("unexpected invocation of MockStore.DeleteDependencyReposByID")
			},
		},
		ListDependencyReposFunc: &StoreListDependencyReposFunc{
			defaultHook: func(context.Context, store.ListDependencyReposOpts) ([]shared.Repo, error) {
				panic("unexpected invocation of MockStore.ListDependencyRepos")
			},
		},
		UpsertDependencyReposFunc: &StoreUpsertDependencyReposFunc{
			defaultHook: func(context.Context, []shared.Repo) ([]shared.Repo, error) {
				panic("unexpected invocation of MockStore.UpsertDependencyRepos")
			},
		},
	}
}

// NewMockStoreFrom creates a new mock of the MockStore interface. All
// methods delegate to the given implementation, unless overwritten.
func NewMockStoreFrom(i store.Store) *MockStore {
	return &MockStore{
		DeleteDependencyReposByIDFunc: &StoreDeleteDependencyReposByIDFunc{
			defaultHook: i.DeleteDependencyReposByID,
		},
		ListDependencyReposFunc: &StoreListDependencyReposFunc{
			defaultHook: i.ListDependencyRepos,
		},
		UpsertDependencyReposFunc: &StoreUpsertDependencyReposFunc{
			defaultHook: i.UpsertDependencyRepos,
		},
	}
}

// StoreDeleteDependencyReposByIDFunc describes the behavior when the
// DeleteDependencyReposByID method of the parent MockStore instance is
// invoked.
type StoreDeleteDependencyReposByIDFunc struct {
	defaultHook func(context.Context, ...int) error
	hooks       []func(context.Context, ...int) error
	history     []StoreDeleteDependencyReposByIDFuncCall
	mutex       sync.Mutex
}

// DeleteDependencyReposByID delegates to the next hook function in the
// queue and stores the parameter and result values of this invocation.
func (m *MockStore) DeleteDependencyReposByID(v0 context.Context, v1 ...int) error {
	r0 := m.DeleteDependencyReposByIDFunc.nextHook()(v0, v1...)
	m.DeleteDependencyReposByIDFunc.appendCall(StoreDeleteDependencyReposByIDFuncCall{v0, v1, r0})
	return r0
}

// SetDefaultHook sets function that is called when the
// DeleteDependencyReposByID method of the parent MockStore instance is
// invoked and the hook queue is empty.
func (f *StoreDeleteDependencyReposByIDFunc) SetDefaultHook(hook func(context.Context, ...int) error) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// DeleteDependencyReposByID method of the parent MockStore instance invokes
// the hook at the front of the queue and discards it. After the queue is
// empty, the default hook function is invoked for any future action.
func (f *StoreDeleteDependencyReposByIDFunc) PushHook(hook func(context.Context, ...int) error) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *StoreDeleteDependencyReposByIDFunc) SetDefaultReturn(r0 error) {
	f.SetDefaultHook(func(context.Context, ...int) error {
		return r0
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *StoreDeleteDependencyReposByIDFunc) PushReturn(r0 error) {
	f.PushHook(func(context.Context, ...int) error {
		return r0
	})
}

func (f *StoreDeleteDependencyReposByIDFunc) nextHook() func(context.Context, ...int) error {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *StoreDeleteDependencyReposByIDFunc) appendCall(r0 StoreDeleteDependencyReposByIDFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of StoreDeleteDependencyReposByIDFuncCall
// objects describing the invocations of this function.
func (f *StoreDeleteDependencyReposByIDFunc) History() []StoreDeleteDependencyReposByIDFuncCall {
	f.mutex.Lock()
	history := make([]StoreDeleteDependencyReposByIDFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// StoreDeleteDependencyReposByIDFuncCall is an object that describes an
// invocation of method DeleteDependencyReposByID on an instance of
// MockStore.
type StoreDeleteDependencyReposByIDFuncCall struct {
	// Arg0 is the value of the 1st argument passed to this method
	// invocation.
	Arg0 context.Context
	// Arg1 is a slice containing the values of the variadic arguments
	// passed to this method invocation.
	Arg1 []int
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 error
}

// Args returns an interface slice containing the arguments of this
// invocation. The variadic slice argument is flattened in this array such
// that one positional argument and three variadic arguments would result in
// a slice of four, not two.
func (c StoreDeleteDependencyReposByIDFuncCall) Args() []interface{} {
	trailing := []interface{}{}
	for _, val := range c.Arg1 {
		trailing = append(trailing, val)
	}

	return append([]interface{}{c.Arg0}, trailing...)
}

// Results returns an interface slice containing the results of this
// invocation.
func (c StoreDeleteDependencyReposByIDFuncCall) Results() []interface{} {
	return []interface{}{c.Result0}
}

// StoreListDependencyReposFunc describes the behavior when the
// ListDependencyRepos method of the parent MockStore instance is invoked.
type StoreListDependencyReposFunc struct {
	defaultHook func(context.Context, store.ListDependencyReposOpts) ([]shared.Repo, error)
	hooks       []func(context.Context, store.ListDependencyReposOpts) ([]shared.Repo, error)
	history     []StoreListDependencyReposFuncCall
	mutex       sync.Mutex
}

// ListDependencyRepos delegates to the next hook function in the queue and
// stores the parameter and result values of this invocation.
func (m *MockStore) ListDependencyRepos(v0 context.Context, v1 store.ListDependencyReposOpts) ([]shared.Repo, error) {
	r0, r1 := m.ListDependencyReposFunc.nextHook()(v0, v1)
	m.ListDependencyReposFunc.appendCall(StoreListDependencyReposFuncCall{v0, v1, r0, r1})
	return r0, r1
}

// SetDefaultHook sets function that is called when the ListDependencyRepos
// method of the parent MockStore instance is invoked and the hook queue is
// empty.
func (f *StoreListDependencyReposFunc) SetDefaultHook(hook func(context.Context, store.ListDependencyReposOpts) ([]shared.Repo, error)) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// ListDependencyRepos method of the parent MockStore instance invokes the
// hook at the front of the queue and discards it. After the queue is empty,
// the default hook function is invoked for any future action.
func (f *StoreListDependencyReposFunc) PushHook(hook func(context.Context, store.ListDependencyReposOpts) ([]shared.Repo, error)) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *StoreListDependencyReposFunc) SetDefaultReturn(r0 []shared.Repo, r1 error) {
	f.SetDefaultHook(func(context.Context, store.ListDependencyReposOpts) ([]shared.Repo, error) {
		return r0, r1
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *StoreListDependencyReposFunc) PushReturn(r0 []shared.Repo, r1 error) {
	f.PushHook(func(context.Context, store.ListDependencyReposOpts) ([]shared.Repo, error) {
		return r0, r1
	})
}

func (f *StoreListDependencyReposFunc) nextHook() func(context.Context, store.ListDependencyReposOpts) ([]shared.Repo, error) {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *StoreListDependencyReposFunc) appendCall(r0 StoreListDependencyReposFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of StoreListDependencyReposFuncCall objects
// describing the invocations of this function.
func (f *StoreListDependencyReposFunc) History() []StoreListDependencyReposFuncCall {
	f.mutex.Lock()
	history := make([]StoreListDependencyReposFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// StoreListDependencyReposFuncCall is an object that describes an
// invocation of method ListDependencyRepos on an instance of MockStore.
type StoreListDependencyReposFuncCall struct {
	// Arg0 is the value of the 1st argument passed to this method
	// invocation.
	Arg0 context.Context
	// Arg1 is the value of the 2nd argument passed to this method
	// invocation.
	Arg1 store.ListDependencyReposOpts
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 []shared.Repo
	// Result1 is the value of the 2nd result returned from this method
	// invocation.
	Result1 error
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c StoreListDependencyReposFuncCall) Args() []interface{} {
	return []interface{}{c.Arg0, c.Arg1}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c StoreListDependencyReposFuncCall) Results() []interface{} {
	return []interface{}{c.Result0, c.Result1}
}

// StoreUpsertDependencyReposFunc describes the behavior when the
// UpsertDependencyRepos method of the parent MockStore instance is invoked.
type StoreUpsertDependencyReposFunc struct {
	defaultHook func(context.Context, []shared.Repo) ([]shared.Repo, error)
	hooks       []func(context.Context, []shared.Repo) ([]shared.Repo, error)
	history     []StoreUpsertDependencyReposFuncCall
	mutex       sync.Mutex
}

// UpsertDependencyRepos delegates to the next hook function in the queue
// and stores the parameter and result values of this invocation.
func (m *MockStore) UpsertDependencyRepos(v0 context.Context, v1 []shared.Repo) ([]shared.Repo, error) {
	r0, r1 := m.UpsertDependencyReposFunc.nextHook()(v0, v1)
	m.UpsertDependencyReposFunc.appendCall(StoreUpsertDependencyReposFuncCall{v0, v1, r0, r1})
	return r0, r1
}

// SetDefaultHook sets function that is called when the
// UpsertDependencyRepos method of the parent MockStore instance is invoked
// and the hook queue is empty.
func (f *StoreUpsertDependencyReposFunc) SetDefaultHook(hook func(context.Context, []shared.Repo) ([]shared.Repo, error)) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// UpsertDependencyRepos method of the parent MockStore instance invokes the
// hook at the front of the queue and discards it. After the queue is empty,
// the default hook function is invoked for any future action.
func (f *StoreUpsertDependencyReposFunc) PushHook(hook func(context.Context, []shared.Repo) ([]shared.Repo, error)) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *StoreUpsertDependencyReposFunc) SetDefaultReturn(r0 []shared.Repo, r1 error) {
	f.SetDefaultHook(func(context.Context, []shared.Repo) ([]shared.Repo, error) {
		return r0, r1
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *StoreUpsertDependencyReposFunc) PushReturn(r0 []shared.Repo, r1 error) {
	f.PushHook(func(context.Context, []shared.Repo) ([]shared.Repo, error) {
		return r0, r1
	})
}

func (f *StoreUpsertDependencyReposFunc) nextHook() func(context.Context, []shared.Repo) ([]shared.Repo, error) {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *StoreUpsertDependencyReposFunc) appendCall(r0 StoreUpsertDependencyReposFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of StoreUpsertDependencyReposFuncCall objects
// describing the invocations of this function.
func (f *StoreUpsertDependencyReposFunc) History() []StoreUpsertDependencyReposFuncCall {
	f.mutex.Lock()
	history := make([]StoreUpsertDependencyReposFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// StoreUpsertDependencyReposFuncCall is an object that describes an
// invocation of method UpsertDependencyRepos on an instance of MockStore.
type StoreUpsertDependencyReposFuncCall struct {
	// Arg0 is the value of the 1st argument passed to this method
	// invocation.
	Arg0 context.Context
	// Arg1 is the value of the 2nd argument passed to this method
	// invocation.
	Arg1 []shared.Repo
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 []shared.Repo
	// Result1 is the value of the 2nd result returned from this method
	// invocation.
	Result1 error
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c StoreUpsertDependencyReposFuncCall) Args() []interface{} {
	return []interface{}{c.Arg0, c.Arg1}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c StoreUpsertDependencyReposFuncCall) Results() []interface{} {
	return []interface{}{c.Result0, c.Result1}
}
