<?php

use App\Http\Controllers\Admin\AuditLogsController;
use App\Http\Controllers\Admin\OutletsController;
use App\Http\Controllers\Admin\StoreProfileController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Catalog\CategoriesController;
use App\Http\Controllers\Catalog\ModifierGroupsController;
use App\Http\Controllers\Catalog\PaymentMethodsController;
use App\Http\Controllers\Catalog\ProductsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\Inventory\IngredientsController;
use App\Http\Controllers\Inventory\PurchasesController;
use App\Http\Controllers\Inventory\RecipesController;
use App\Http\Controllers\Inventory\StockAdjustmentsController;
use App\Http\Controllers\Inventory\StockController;
use App\Http\Controllers\Inventory\SuppliersController;
use App\Http\Controllers\Inventory\UomController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\Transactions\OrdersController;
use App\Http\Controllers\Transactions\ShiftsController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

// Guest (login) routes. Already-signed-in redirect is handled in the controller.
Route::get('login', [LoginController::class, 'create'])->name('login');
Route::post('login', [LoginController::class, 'store'])->name('login.store');

// Authenticated dashboard (role-gated: admin/manager only).
Route::middleware('dashboard')->group(function (): void {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('logout', [LoginController::class, 'destroy'])->name('logout');

    // Reports.
    Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [ReportsController::class, 'export'])->name('reports.export');

    // Catalog — Products.
    Route::get('products', [ProductsController::class, 'index'])->name('products.index');
    Route::get('products/create', [ProductsController::class, 'create'])->name('products.create');
    Route::get('products/{product}/edit', [ProductsController::class, 'edit'])->name('products.edit');
    Route::post('products', [ProductsController::class, 'store'])->name('products.store');
    Route::get('products/{product}/price-history', [ProductsController::class, 'priceHistory'])->name('products.price-history');
    Route::post('products/import', [ProductsController::class, 'import'])->name('products.import');
    Route::post('products/bulk-delete', [ProductsController::class, 'bulkDestroy'])->name('products.bulk-destroy');
    Route::patch('products/{product}', [ProductsController::class, 'update'])->name('products.update');
    Route::delete('products/{product}', [ProductsController::class, 'destroy'])->name('products.destroy');
    Route::post('products/{product}/restore', [ProductsController::class, 'restore'])->name('products.restore');
    Route::post('products/{product}/image', [ProductsController::class, 'uploadImage'])->name('products.upload-image');
    Route::delete('products/{product}/image', [ProductsController::class, 'deleteImage'])->name('products.delete-image');

    // Catalog — Categories.
    Route::get('categories', [CategoriesController::class, 'index'])->name('categories.index');
    Route::get('categories/create', [CategoriesController::class, 'create'])->name('categories.create');
    Route::get('categories/{category}/edit', [CategoriesController::class, 'edit'])->name('categories.edit');
    Route::post('categories', [CategoriesController::class, 'store'])->name('categories.store');
    Route::post('categories/bulk-delete', [CategoriesController::class, 'bulkDestroy'])->name('categories.bulk-destroy');
    Route::patch('categories/{category}', [CategoriesController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [CategoriesController::class, 'destroy'])->name('categories.destroy');
    Route::post('categories/{category}/restore', [CategoriesController::class, 'restore'])->name('categories.restore');

    // Catalog — Modifier groups & modifiers.
    Route::get('modifier-groups', [ModifierGroupsController::class, 'index'])->name('modifier-groups.index');
    Route::get('modifier-groups/create', [ModifierGroupsController::class, 'create'])->name('modifier-groups.create');
    Route::get('modifier-groups/{group}/edit', [ModifierGroupsController::class, 'edit'])->name('modifier-groups.edit');
    Route::post('modifier-groups', [ModifierGroupsController::class, 'store'])->name('modifier-groups.store');
    Route::post('modifier-groups/bulk-delete', [ModifierGroupsController::class, 'bulkDestroy'])->name('modifier-groups.bulk-destroy');
    Route::patch('modifier-groups/{group}', [ModifierGroupsController::class, 'update'])->name('modifier-groups.update');
    Route::delete('modifier-groups/{group}', [ModifierGroupsController::class, 'destroy'])->name('modifier-groups.destroy');
    Route::post('modifier-groups/{group}/modifiers', [ModifierGroupsController::class, 'storeModifier'])->name('modifier-groups.modifiers.store');
    Route::patch('modifier-groups/{group}/modifiers/{modifier}', [ModifierGroupsController::class, 'updateModifier'])->name('modifier-groups.modifiers.update');
    Route::delete('modifier-groups/{group}/modifiers/{modifier}', [ModifierGroupsController::class, 'destroyModifier'])->name('modifier-groups.modifiers.destroy');

    // Catalog — Payment methods.
    Route::get('payment-methods', [PaymentMethodsController::class, 'index'])->name('payment-methods.index');
    Route::get('payment-methods/create', [PaymentMethodsController::class, 'create'])->name('payment-methods.create');
    Route::get('payment-methods/{method}/edit', [PaymentMethodsController::class, 'edit'])->name('payment-methods.edit');
    Route::post('payment-methods', [PaymentMethodsController::class, 'store'])->name('payment-methods.store');
    Route::patch('payment-methods/{method}', [PaymentMethodsController::class, 'update'])->name('payment-methods.update');

    // Shared — image upload (dashboard-owned public disk).
    Route::post('uploads/image', [ImageUploadController::class, 'store'])->name('uploads.image');

    /* ---------------------------------------------------------- Inventaris */

    // Ingredients.
    Route::get('ingredients', [IngredientsController::class, 'index'])->name('ingredients.index');
    Route::get('ingredients/create', [IngredientsController::class, 'create'])->name('ingredients.create');
    Route::get('ingredients/{ingredient}/edit', [IngredientsController::class, 'edit'])->name('ingredients.edit');
    Route::post('ingredients', [IngredientsController::class, 'store'])->name('ingredients.store');
    Route::post('ingredients/bulk-delete', [IngredientsController::class, 'bulkDestroy'])->name('ingredients.bulk-destroy');
    Route::patch('ingredients/{ingredient}', [IngredientsController::class, 'update'])->name('ingredients.update');
    Route::delete('ingredients/{ingredient}', [IngredientsController::class, 'destroy'])->name('ingredients.destroy');
    Route::post('ingredients/{ingredient}/restore', [IngredientsController::class, 'restore'])->name('ingredients.restore');

    // UoM.
    Route::get('uom', [UomController::class, 'index'])->name('uom.index');
    Route::get('uom/create', [UomController::class, 'create'])->name('uom.create');
    Route::post('uom', [UomController::class, 'store'])->name('uom.store');

    // Suppliers.
    Route::get('suppliers', [SuppliersController::class, 'index'])->name('suppliers.index');
    Route::get('suppliers/create', [SuppliersController::class, 'create'])->name('suppliers.create');
    Route::get('suppliers/{supplier}/edit', [SuppliersController::class, 'edit'])->name('suppliers.edit');
    Route::post('suppliers', [SuppliersController::class, 'store'])->name('suppliers.store');
    Route::post('suppliers/bulk-delete', [SuppliersController::class, 'bulkDestroy'])->name('suppliers.bulk-destroy');
    Route::patch('suppliers/{supplier}', [SuppliersController::class, 'update'])->name('suppliers.update');
    Route::delete('suppliers/{supplier}', [SuppliersController::class, 'destroy'])->name('suppliers.destroy');

    // Recipes (product & modifier BOM).
    Route::get('recipes', [RecipesController::class, 'index'])->name('recipes.index');
    Route::get('recipes/product/{product}', [RecipesController::class, 'productRecipe'])->name('recipes.read-product');
    Route::put('recipes/product/{product}', [RecipesController::class, 'saveProductRecipe'])->name('recipes.save-product');
    Route::get('recipes/modifier/{modifier}', [RecipesController::class, 'modifierRecipe'])->name('recipes.read-modifier');
    Route::put('recipes/modifier/{modifier}', [RecipesController::class, 'saveModifierRecipe'])->name('recipes.save-modifier');

    // Purchases / restock.
    Route::get('purchases', [PurchasesController::class, 'index'])->name('purchases.index');
    Route::get('purchases/create', [PurchasesController::class, 'create'])->name('purchases.create');
    Route::post('purchases', [PurchasesController::class, 'store'])->name('purchases.store');

    // Stock adjustments + waste.
    Route::get('stock-adjustments', [StockAdjustmentsController::class, 'index'])->name('stock-adjustments.index');
    Route::get('stock-adjustments/create', [StockAdjustmentsController::class, 'create'])->name('stock-adjustments.create');
    Route::post('stock-adjustments', [StockAdjustmentsController::class, 'store'])->name('stock-adjustments.store');
    Route::post('stock-adjustments/waste', [StockAdjustmentsController::class, 'waste'])->name('stock-adjustments.waste');

    // Stock ledger + summary.
    Route::get('stock-movements', [StockController::class, 'movements'])->name('stock-movements.index');
    Route::get('inventory-summary', [StockController::class, 'summary'])->name('inventory.summary');

    /* --------------------------------------------------------- Transaksi */

    Route::get('orders', [OrdersController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrdersController::class, 'show'])->name('orders.show');
    Route::post('orders/{order}/void', [OrdersController::class, 'void'])->name('orders.void');

    Route::get('shifts', [ShiftsController::class, 'current'])->name('shifts.index');

    /* ------------------------------------------------------ Administrasi */

    // Store profile (manage: admin + manager).
    Route::get('store-profile', [StoreProfileController::class, 'edit'])->name('store-profile.edit');
    Route::put('store-profile', [StoreProfileController::class, 'update'])->name('store-profile.update');

    // Admin-only surfaces.
    Route::middleware('admin')->group(function (): void {
        Route::get('users', [UsersController::class, 'index'])->name('users.index');
        Route::get('users/create', [UsersController::class, 'create'])->name('users.create');
        Route::get('users/{user}/edit', [UsersController::class, 'edit'])->name('users.edit');
        Route::post('users', [UsersController::class, 'store'])->name('users.store');
        Route::post('users/bulk-delete', [UsersController::class, 'bulkDestroy'])->name('users.bulk-destroy');
        Route::patch('users/{user}', [UsersController::class, 'update'])->name('users.update');
        Route::post('users/{user}/reset-password', [UsersController::class, 'resetPassword'])->name('users.reset-password');
        Route::delete('users/{user}', [UsersController::class, 'destroy'])->name('users.destroy');
        Route::post('users/{user}/restore', [UsersController::class, 'restore'])->name('users.restore');

        Route::get('outlets', [OutletsController::class, 'index'])->name('outlets.index');
        Route::get('outlets/create', [OutletsController::class, 'create'])->name('outlets.create');
        Route::get('outlets/{outlet}/edit', [OutletsController::class, 'edit'])->name('outlets.edit');
        Route::post('outlets', [OutletsController::class, 'store'])->name('outlets.store');
        Route::post('outlets/bulk-delete', [OutletsController::class, 'bulkDestroy'])->name('outlets.bulk-destroy');
        Route::patch('outlets/{outlet}', [OutletsController::class, 'update'])->name('outlets.update');
        Route::delete('outlets/{outlet}', [OutletsController::class, 'destroy'])->name('outlets.destroy');

        Route::get('audit-logs', [AuditLogsController::class, 'index'])->name('audit-logs.index');
    });
});
